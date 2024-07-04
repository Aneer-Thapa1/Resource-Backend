const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookie.token;

  if (!token) return res.status(401).json({ message: "Not Authorized!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, result) => {
    if (error) return res.status(403).json({ message: "Token is not valid!" });
    req.user_id = result.user_id;
    next();
  });
};
