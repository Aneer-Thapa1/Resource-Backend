const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { PrismaClient } = require("@prisma/client");
const { department } = require("../prismaClient");
const { logger } = require("../middleware/logger");
const prisma = new PrismaClient();

const signup = async (req, res) => {
  const { user_name, user_email, password } = req.body;
  // Validate user input
  if (!user_name || !user_email || !password) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  const regex = /@iic\.edu\.np$/;
  if (!regex.test(user_email)) {
    return res.status(400).json({ error: "Email is invalid!" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: "Password must be a strong!" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        user_email: user_email,
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await prisma.$transaction(async (prisma) => {
      const createDepartment = await prisma.department.create({
        data: {
          department_name: "Resource",
        },
      });

      const newUser = await prisma.users.create({
        data: {
          user_name,
          user_email,
          password: hashedPassword,
          isActive: true,
          department_id: createDepartment.department_id,
          role: "superadmin",
        },
      });
      return { createDepartment, newUser };
    });

    return res
      .status(201)
      .json({ message: "User signed up successfully", result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const login = async (req, res) => {
  const { user_email, password } = req.body;

  logger.info("Login attempt", {
    email: user_email,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  });

  try {
    // check if any field is empty
    if (!user_email || !password) {
      logger.warn("Login failed: Empty fields", {
        email: user_email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });
      return res.status(400).json({ error: "Please fill all the fields!" });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: {
        user_email: user_email,
      },
      include: {
        department: true,
      },
    });

    if (!user) {
      logger.warn("Login failed: User not found", {
        email: user_email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });
      return res.status(404).json({ error: "User not found!" });
    }

    if (!user.isActive) {
      logger.warn("Login failed: Inactive user", {
        userId: user.user_id,
        email: user_email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });
      return res.status(403).json({ error: "You are currently inactive!" });
    }

    // Verify password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      logger.warn("Login failed: Invalid password", {
        userId: user.user_id,
        email: user_email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });
      return res.status(401).json({ error: "Invalid password!" });
    }

    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Generate JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.SECRETKEY, {
      expiresIn: maxAge,
    });

    const userData = {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_role: user.role,
      user_contact: user.contact,
      department: user.department.department_name,
      token,
    };

    // Log successful login
    logger.info("Login successful", {
      userId: user.user_id,
      username: user.user_name,
      email: user.user_email,
      role: user.role,
      department: user.department.department_name,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    });

    // Send token in response
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "strict",
        maxAge: maxAge,
        path: "/",
      })
      .status(200)
      .json({
        message: "User logged in successfully",
        userData,
      });
  } catch (error) {
    logger.error("Login failed: Unexpected error", {
      email: user_email,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    });
    return res.status(500).json({ error: "Login failed!" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    console.log("Cookie cleared");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Logout failed" });
  }
};

module.exports = {
  signup,
  login,
  logout,
};
