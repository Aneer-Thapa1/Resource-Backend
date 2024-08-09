const prisma = require("../prismaClient");

const addUser = async (req, res) => {
  const { user_name, user_email, department } = req.body;

  if (!user_name || !user_email || !department) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.userPool.findUnique({
      where: {
        user_email: user_email,
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists!" });
    }

    // Create new user
    const addNewUser = await prisma.userPool.create({
      data: {
        user_name: user_name,
        user_email: user_email,
        department: department,
        status: false,
      },
    });

    return res
      .status(201)
      .json({ message: "User added successfully!", addNewUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const usersList = await prisma.userPool.findMany({});
    return res
      .status(200)
      .json({ message: "User pool fetched successfully!", users: usersList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

module.exports = { addUser, getAllUsers };
