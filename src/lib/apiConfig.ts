/**
 * Centralized API configuration.
 *
 * The base URL is read from the VITE_API_URL environment variable.
 * - Local dev: set VITE_API_URL=http://localhost:4000/api (see .env)
 * - Vercel (same-domain API routes): no env var needed – defaults to "/api"
 * - External backend: set VITE_API_URL=https://your-backend.example.com/api
 */
export const API_URL: string = import.meta.env.VITE_API_URL || "/api";
