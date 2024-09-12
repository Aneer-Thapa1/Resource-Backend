const winston = require("winston");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Ensure log directory exists
const logDirectory = path.join(__dirname, "logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Create Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "success.log"),
      level: "info",
    }),
  ],
});

// Create a write stream for Morgan (access logs)
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// Custom token for response body
morgan.token("res-body", (req, res) => {
  if (res.statusCode >= 400) {
    return JSON.stringify(res.body) || "";
  }
  return "";
});

// Create Morgan middleware
const morganMiddleware = morgan(
  ":method :url :status :response-time ms - :res[content-length] :res-body",
  {
    stream: {
      write: (message) => {
        const status = parseInt(message.split(" ")[2]);
        if (status >= 400) {
          logger.error(message.trim());
        } else {
          logger.info(message.trim());
        }
      },
    },
  }
);

module.exports = { logger, morganMiddleware };
