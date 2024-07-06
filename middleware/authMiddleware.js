// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const secret = "your_jwt_secret";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send("Access Denied");
    }

    try {
      const decoded = jwt.verify(token.split(" ")[1], secret);
      req.user = decoded;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).send("Forbidden");
      }
      next();
    } catch (err) {
      return res.status(400).send("Invalid Token");
    }
  };
};

module.exports = authMiddleware;
