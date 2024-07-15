const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const signup = async (req, res) => {
  const { user_name, user_email, password } = req.body;

  console.log(user_email, user_name, password);

  // Validate user input
  if (!user_name || !user_email || !password) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  const regex = /@iic\.edu\.np$/;
  if (!regex.test(user_email)) {
    return res.status(400).json({ error: "Email is invalid!" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
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
    const newUser = await prisma.users.create({
      data: {
        user_name,
        user_email,
        password: hashedPassword,
      },
    });
    s;

    return res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const login = async (req, res) => {
  const { user_email, password } = req.body;

  try {
    // check if any field is empty
    if (!user_email || !password) {
      return res.status(400).json({ error: "Please fill all the fields!" });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: {
        user_email: user_email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Verify password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Generate JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.SECRETKEY, {
      expiresIn: maxAge,
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
      .json({ message: "User logged in successfully", token: token });
  } catch (error) {
    console.error(error);
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
