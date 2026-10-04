/**
 * Local development entry-point.
 * For Vercel Serverless Functions see api/index.js which requires ./app instead.
 */
const createApp = require('./app');
const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Fast Hackathon Backend running on http://localhost:${PORT}`);
});
