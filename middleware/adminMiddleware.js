const jwt = require("jsonwebtoken");
const { users } = require("../prismaClient");
const prisma = require("../prismaClient");

const adminMiddleware = async (req, res, next) => {
    try {
        // Extract token from the Authorization header
        const token = req.headers.authorization.split(" ")[1]; // Assuming token format: Bearer <token>
        
        if (!token) {
            return res.status(401).json({ message: "Authorization token is missing" });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.SECRETKEY);

        // Fetch user details from the database based on the decoded token
        const user = await prisma.users.findUnique({
            where: {
                user_id: decodedToken.id // Assuming `decodedToken.id` holds the correct user_id
            }
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach user object to the request for further use
        req.user = user;

        // Check if the user is an admin
        if (user.role === 'ADMIN') {
            next(); // Allow the request to proceed to the next middleware or route handler
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }
    } catch (err) {
        console.error("Error in admin middleware:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = adminMiddleware;