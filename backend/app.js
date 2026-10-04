/**
 * Express application factory for the MoodSync backend.
 *
 * This module exports createApp() so it can be:
 *  - Required by server.js for local development (app.listen)
 *  - Imported by api/index.js for Vercel Serverless Functions
 *
 * In a serverless environment the SQLite db is copied to /tmp (the only
 * writable directory on Vercel) on first cold-start, then reused for the
 * lifetime of the warm instance.
 */
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_super_secret_key_123!';

// Determine the database path (writable on Vercel via /tmp)
let dbPath;
if (process.env.VERCEL) {
  // On Vercel, /tmp is the only writable directory
  dbPath = path.resolve('/tmp', 'database.sqlite');
  // Try to copy the bundled DB so existing data is preserved on first cold-start
  const possibleSources = [
    path.resolve(__dirname, 'backend', 'database.sqlite'),
    path.resolve(__dirname, 'database.sqlite'),
    path.resolve(process.cwd(), 'backend', 'database.sqlite'),
  ];
  for (const sourceDbPath of possibleSources) {
    if (fs.existsSync(sourceDbPath) && !fs.existsSync(dbPath)) {
      try { fs.copyFileSync(sourceDbPath, dbPath); break; }
      catch (e) { console.error('Could not copy DB to /tmp:', e); }
    }
  }
} else {
  dbPath = path.resolve(__dirname, 'database.sqlite');
}

// Optional MCP client (Spotify Therapist) — gracefully degrades if unavailable
let mcpClient = null;

async function setupMcpClient() {
  try {
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

        // Try multiple possible locations for the MCP server file
    const mcpCandidates = [
      path.resolve(__dirname, 'mcp', 'spotify-therapist.mjs'),
      path.resolve(__dirname, 'backend', 'mcp', 'spotify-therapist.mjs'),
      path.resolve(__dirname, '..', 'backend', 'mcp', 'spotify-therapist.mjs'),
    ];
    const mcpServerPath = mcpCandidates.find(p => fs.existsSync(p));

    if (!mcpServerPath) {
      throw new Error('MCP server file not found (non-fatal in serverless environments)');
    }

    const transport = new StdioClientTransport({
      command: "node",
      args: [mcpServerPath]
    });

    mcpClient = new Client({ name: "MoodSyncApp", version: "1.0.0" }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    console.log("✅ Connected to local MCP Spotify Therapist Server.");
  } catch (err) {
    console.error("Failed to connect to MCP Server (non-fatal):", err);
  }
}
setupMcpClient();

/**
 * Create and return a configured Express app instance.
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Middleware — allow CORS from anywhere (restrict via CORS_ORIGINS env in production)
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : '*';
  app.use(cors({ origin: corsOrigins, credentials: false }));
  app.use(express.json());

  // Database Setup
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message);
    } else {
      console.log('Connected to SQLite database.');
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS emotions_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        emotion TEXT NOT NULL,
        mode TEXT NOT NULL,
        playlist TEXT NOT NULL,
        confidence REAL NOT NULL,
        mood_score INTEGER DEFAULT 0,
        scan_type TEXT DEFAULT 'pre',
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);
      db.run(`ALTER TABLE emotions_history ADD COLUMN mood_score INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE emotions_history ADD COLUMN scan_type TEXT DEFAULT 'pre'`, () => {});
    }
  });

  // --- Auth Middleware ---
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
          message: 'User registered successfully',
          token: jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' }),
          user: { id: this.lastID, email }
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });
    });
  });

  // Save Emotion Detection
  app.post('/api/emotions', authenticateToken, async (req, res) => {
    const { emotion, mode, playlist, confidence, platform = 'spotify', mood_score = 0, scan_type = 'pre' } = req.body;
    const userId = req.user.id;
    if (!emotion || !mode || !playlist) {
      return res.status(400).json({ error: 'Missing required detection data' });
    }
    let mcpMessage = "Let's vibe.";
    let mcpPlaylist = playlist;
    if (mcpClient) {
      try {
        const result = await mcpClient.callTool({
          name: "get_therapeutic_playlist",
          arguments: { emotion, platform }
        });
        if (result.content && result.content[0] && result.content[0].text) {
          const data = JSON.parse(result.content[0].text);
          mcpPlaylist = data.playlist_id;
          mcpMessage = data.message;
        }
      } catch (err) {
        console.error("MCP call failed:", err);
      }
    }
    db.run(
      `INSERT INTO emotions_history (user_id, emotion, mode, playlist, confidence, mood_score, scan_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, emotion, mode, mcpPlaylist, confidence || 0, mood_score, scan_type],
      function (err) {
        if (err) return res.status(500).json({ error: 'Failed to save emotion history' });
        res.status(201).json({
          message: 'Emotion saved successfully',
          id: this.lastID,
          ai_message: mcpMessage,
          playlist_id: mcpPlaylist
        });
      }
    );
  });

  // Get Emotion History
  app.get('/api/emotions', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all(
      `SELECT * FROM emotions_history WHERE user_id = ? ORDER BY detected_at DESC LIMIT 50`,
      [userId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch history' });
        res.json(rows);
      }
    );
  });

  // Get Mood Progress
  app.get('/api/emotions/progress', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all(
      `SELECT id, emotion, mood_score, scan_type, confidence, detected_at 
       FROM emotions_history 
       WHERE user_id = ? 
       ORDER BY detected_at ASC 
       LIMIT 100`,
      [userId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch progress' });
        res.json(rows);
      }
    );
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}

module.exports = createApp;
module.exports.dbPath = dbPath;
