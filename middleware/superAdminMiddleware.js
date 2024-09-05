const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const superAdminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  } catch (err) {
    console.error("Error in super admin middleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = superAdminMiddleware;
