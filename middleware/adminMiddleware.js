const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.SECRETKEY);

    const user = await prisma.users.findUnique({
      where: {
        user_id: decodedToken.id,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    // Attach user object to the request for further use
    req.user = user;
    // Check if the user is an admin
    if (user.role === "admin" || user.role == "superadmin") {
      next();
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (err) {
    console.error("Error in admin middleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = adminMiddleware;
