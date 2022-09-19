const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  trackerPort: process.env.TRACKER_PORT || 8001,
  staticFilesPort: process.env.STATIC_PORT || 8000,
  connectionStr: process.env.DB_CONNECTION_STRING,
};
