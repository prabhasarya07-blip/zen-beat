import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "SpotifyTherapist",
  version: "1.0.0"
});

const SPOTIFY_PLAYLISTS = {
  happy: "37i9dQZF1DWSf2RDTDayIx", // Happy Beats
  sad: "37i9dQZF1DWZq91oLsHZvy", // Relaxing Acoustic
  angry: "37i9dQZF1DXcBWIGoYBM5M", // Peaceful Piano
  tired: "37i9dQZF1DWZeKCadgRdKQ", // Deep Focus
  neutral: "37i9dQZF1DXcRXFNfZr7Tp" // Chill Lofi
};

const WYNK_PLAYLISTS = {
  happy: "https://wynk.in/music/package/happy-hits", 
  sad: "https://wynk.in/music/package/sad-songs", 
  angry: "https://wynk.in/music/package/peaceful-piano", 
  tired: "https://wynk.in/music/package/lofi-study-beats", 
  neutral: "https://wynk.in/music/package/chill-hits" 
};

const JIOSAAVN_PLAYLISTS = {
  happy: "https://www.jiosaavn.com/featured/happy-hits/happy", 
  sad: "https://www.jiosaavn.com/featured/sad-songs/sad", 
  angry: "https://www.jiosaavn.com/featured/peaceful-piano/peace", 
  tired: "https://www.jiosaavn.com/featured/lofi-study-beats/lofi", 
  neutral: "https://www.jiosaavn.com/featured/chill-hits/chill" 
};

const GAANA_PLAYLISTS = {
  happy: "https://gaana.com/playlist/gaana-dj-happy-hits-hindi", 
  sad: "https://gaana.com/playlist/gaana-dj-sad-songs-hindi", 
  angry: "https://gaana.com/playlist/gaana-dj-peace-piano", 
  tired: "https://gaana.com/playlist/gaana-dj-lofi-beats", 
  neutral: "https://gaana.com/playlist/gaana-dj-chill-maro" 
};

const THERAPIST_RESPONSES = {
  happy: "I love the energy! Let's keep that momentum going with some upbeat focus tracks. 🚀",
  sad: "I see you might be feeling a bit down. That's totally okay. I've queued up some relaxing acoustic music to help you decompress. 🌿",
  angry: "It looks like you're feeling frustrated right now. Let's take a deep breath and let this peaceful piano help clear your mind. 🎹",
  tired: "You seem exhausted. I'm putting on some gentle Deep Focus lofi beats so you can push through or wind down smoothly. ☕",
  neutral: "You're in a calm, neutral state. Here's a chill lofi playlist to maintain your steady vibe. 🎧"
};

server.tool(
  "get_therapeutic_playlist",
  "Get a dynamic therapeutic message and specific Spotify or Wynk playlist based on the user's emotion",
  { 
    emotion: z.string(),
    platform: z.enum(["spotify", "wynk", "jiosaavn", "gaana"]).optional().default("spotify")
  },
  async ({ emotion, platform }) => {
    const emotionKey = emotion.toLowerCase();
    
    // Platform routing
    let playlistId = "";
    if (platform === "wynk") {
      playlistId = WYNK_PLAYLISTS[emotionKey] || WYNK_PLAYLISTS.neutral;
    } else if (platform === "jiosaavn") {
      playlistId = JIOSAAVN_PLAYLISTS[emotionKey] || JIOSAAVN_PLAYLISTS.neutral;
    } else if (platform === "gaana") {
      playlistId = GAANA_PLAYLISTS[emotionKey] || GAANA_PLAYLISTS.neutral;
    } else {
      playlistId = SPOTIFY_PLAYLISTS[emotionKey] || SPOTIFY_PLAYLISTS.neutral;
    }

    const message = THERAPIST_RESPONSES[emotionKey] || THERAPIST_RESPONSES.neutral;
    
    return {
      content: [{ type: "text", text: JSON.stringify({ playlist_id: playlistId, platform, message }) }]
    };
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch(console.error);
