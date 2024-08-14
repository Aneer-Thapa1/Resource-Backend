const prisma = require("../prismaClient");
const transporter = require("../config/nodeMailerConfig");
const { getIo } = require("../socket");
const newUserMail = require("../mail/newUser.skeleton");
const bcrypt = require("bcrypt");

const getUser = async (req, res) => {
  try {
    const allUser = await prisma.users.findMany({
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        department: true,
        role: true,
        isActive: true,
      },
    });

    const transformedUsers = allUser.map((user) => ({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      role: user.role,
      isActive: user.isActive,
      department_name: user.department.department_name,
    }));

    return res.status(200).json({
      users: transformedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get all the users!" });
  }
};

const addUser = async (req, res) => {
  const { user_email, user_name, department } = req.body;

  if (!user_name || !user_email || !department) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }
  try {
    const checkDepartment = await prisma.department.findFirst({
      where: {
        department_name: department,
      },
    });

    // Check if the user already exists
    const existingUser = await prisma.userPool.findUnique({
      where: {
        user_email: user_email,
      },
    });

    const regex = /@iic\.edu\.np$/;
    if (!regex.test(user_email)) {
      return res.status(400).json({ error: "Email is invalid!" });
    }

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists!" });
    }

    if (!checkDepartment)
      return res.status(200).json({ error: "department not found !" });

    const defaultPassword = "rar@iicResource";
    const salt = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const addUser = await prisma.users.create({
      data: {
        user_name: user_name,
        user_email: user_email,
        password: hashedPassword,
        isActive: false,
        department: {
          connect: { department_id: checkDepartment.department_id },
        },
      },
      include: {
        department: true,
      },
    });

    const response = {
      message: "New user added successfully",
      newUser: {
        user_id: addUser.user_id,
        user_name: addUser.user_name,
        user_email: addUser.user_email,
        password: addUser.password,
        role: addUser.role,
        otp: addUser.otp,
        otp_expiry: addUser.otp_expiry,

        isActive: addUser.isActive,
        department_name: addUser.department.department_name,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};

const setActiveUser = async (req, res) => {
  const user_id = Number(req.params.user_id);
  try {
    const user = await prisma.users.findFirst({
      where: {
        user_id: user_id,
      },
    });

    if (!user) return res.status(400).json({ message: "user does not exist " });

    const activeUser = await prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        isActive: true,
      },
    });
    const mailOptions = newUserMail(user.user_email, user.user_name);
    await transporter.sendMail(mailOptions);

    console.log(activeUser);

    return res
      .status(200)
      .json({ message: "user is Active Now !", activeUser });
  } catch (error) {
    console.log({ message: "error in setActiveUser :", error: error.message });
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};

const setInActiveUser = async (req, res) => {
  const user_id = Number(req.params.user_id);
  console.log(user_id);
  try {
    const user = await prisma.users.findFirst({
      where: {
        user_id: user_id,
      },
    });

    if (!user) return res.status(400).json({ message: "user does not exist " });

    const activeUser = await prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        isActive: false,
      },
    });

    console.log(activeUser);
    const mailOptions = newUserMail(user.user_email, user.user_name);
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "user is Active Now !", activeUser });
  } catch (error) {
    console.log({ message: "error in setActiveUser :", error: error.message });
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id, 10);
    const { role } = req.body;

    console.log("User ID received:", user_id);
    console.log("Role received:", role);

    // Validate input
    if (isNaN(user_id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (typeof role !== "string" || role.trim() === "") {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Update the user's role
    const updatedUser = await prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        role: role,
      },
    });

    console.log("Updated User Role:", updatedUser.role);

    return res.status(200).json({
      message: "User role updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUser,
  addUser,
  setActiveUser,
  setInActiveUser,
  updateUserRole,
};
