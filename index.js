const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const nodemailer = require("nodemailer");
const http = require("http");
const { logger, morganMiddleware } = require("./middleware/logger");

const app = express();

// Use Morgan middleware for logging
app.use(morganMiddleware);

// Middleware to parse JSON
app.use(express.json());

// Enable CORS with specific options
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Parse cookies
app.use(cookieParser());

// Serve static files from the 'uploads' directory
app.use(express.static("uploads"));

// Use the routes
app.use("/api", routes);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "habit234@gmail.com",
    pass: "Habitpulse234",
  },
});

// Start the server
const server = http.createServer(app);

// Import and setup socket
const { setupSocket } = require("./socket");
setupSocket(server);

const port = process.env.PORT || 3000; // Fallback to 3000 if PORT is not set

server.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Error", { error: err.message, stack: err.stack });
  res.status(500).send("Something broke!");
});
