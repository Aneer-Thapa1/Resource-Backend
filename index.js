const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
require("dotenv").config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files from the 'uploads' directory
app.use(express.static("uploads"));

// Use the routes
app.use("/api", routes);

// Start the server
const port = process.env.PORT || 8898;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
