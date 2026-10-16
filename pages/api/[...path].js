// All Express routes (/api/users, /api/captain, /api/maps, /api/ride, /api/health) run as a
// single serverless function. NextAuth lives in app/api/auth and is more specific, so it wins.
import app from "../../server/app";

export const config = {
  api: {
    bodyParser: false, // Express parses the body itself
    externalResolver: true,
  },
};

export default app;
