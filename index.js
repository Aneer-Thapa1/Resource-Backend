const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

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

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
