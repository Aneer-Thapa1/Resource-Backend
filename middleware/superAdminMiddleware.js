const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const superAdminMiddleware = async (req, res, next) => {
  try {
    const authorizationHeaderValue = req.headers["authorization"];
    const token = authorizationHeaderValue.split("Bearer ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.SECRETKEY);
    console.log("superadmin :" + decodedToken);
    const user = await prisma.users.findUnique({
      where: {
        user_id: decodedToken.id,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    // Attach user object to the request for further use
    req.user = user.id;

    // Check if the user is an admin
    if (user.role == "superadmin") {
      next();
    } else {
      console.log(user.role);
      return res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (err) {
    console.error("Error in admin middleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = superAdminMiddleware;
