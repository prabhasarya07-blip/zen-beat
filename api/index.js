/**
 * Vercel Serverless Function entry-point.
 *
 * Each incoming HTTP request to /api/* is routed here by Vercel.
 * The Express app is created once per cold-start and reused for subsequent
 * requests on the same warm instance.
 */
const createApp = require('../backend/app');

// Create the Express app once (persists across invocations on warm instances)
const app = createApp();

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async (req, res) => {
  // Let Express handle the request
  await app(req, res);
};
