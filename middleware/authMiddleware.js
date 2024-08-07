const jwt = require("jsonwebtoken");
const { users } = require("../prismaClient");

const authMiddleware =  (roles = []) => {
  return async(req, res, next) => {
    const authorizationHeaderValue = req.headers["authorization"];
    if (!authorizationHeaderValue || !authorizationHeaderValue.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access Denied" });
    }
    const token = authorizationHeaderValue.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access Denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRETKEY);
      console.log(decoded);
      const user = await users.findUnique({
        where:{
          user_id:decoded.id
        }
      })
      req.user = user;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).send("Forbidden");
      }
      next();
    } catch (err) {
      console.log("Token validation error:", err);
      return res.status(400).send("Invalid Token");
    }
  };
};

module.exports = authMiddleware;
