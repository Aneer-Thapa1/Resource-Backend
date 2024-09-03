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
        contact: true,
        isActive: true,
      },
    });

    const transformedUsers = allUser.map((user) => ({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      contact: user.contact,
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
  const { user_email, user_name, department, contact } = req.body;

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
    const existingUser = await prisma.users.findUnique({
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
        contact: contact,
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
        contact: addUser.contact,
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
        isActive: true,
      },
    });
    const mailOptions = newUserMail(user.user_email, user.user_name);
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "user is Active Now !" });
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

    if (!user) return res.status(400).json({ message: "user does not exist" });

    const activeUser = await prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        isActive: false,
        role: "user",
      },
    });

    const mailOptions = newUserMail(user.user_email, user.user_name);
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "user is Active Now !" });
  } catch (error) {
    console.log({ message: "error in setActiveUser :", error: error.message });
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};

const allUserForMessage = async (req, res) => {
  try {
    const userid = req.user.user_id;

    const allUser = await prisma.users.findMany({
      where: {
        NOT: {
          user_id: userid,
        },
      },
    });

    return res.status(200).json({ allUser });
  } catch (error) {
    console.log({
      message: "Error in allUserForMessage:",
      error: error.message,
    });
    return res.status(500).json({ error: "Internal Server Error!" });
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

const editUser = async (req, res) => {
  try {
    const user_Id = Number(req.params.user_id);
    const { user_name, contact, user_email, department } = req.body;

    const regex = /@iic\.edu\.np$/;
    if (!regex.test(user_email)) {
      return res.status(400).json({ error: "Email is invalid!" });
    }

    if (!user_name || !user_email || !department || !contact) {
      return res.status(400).json({ error: "Please fill all the fields!" });
    }

    const checkDepartment = await prisma.department.findFirst({
      where: {
        department_name: department,
      },
    });

    if (!checkDepartment)
      return res.status(400).json({ error: "department not found !" });

    const editData = await prisma.users.update({
      where: {
        user_id: user_Id,
      },
      data: {
        user_name: user_name,
        user_email: user_email,
        contact: contact,
        department: {
          connect: { department_id: checkDepartment.department_id },
        },
      },
    });
    return res.status(200).json({ user: editData });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const NoOfActiveUser = async (req, res) => {
  try {
    const ActiveData = await prisma.users.findMany({
      where: {
        isActive: true,
      },
    });
    return res.status(201).json({ activeUser: ActiveData.length });
  } catch (error) {
    console.error("Error getting Active user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { current_password, password, confirm_password } = req.body;

    // Check if all fields are provided
    if (!current_password || !password || !confirm_password) {
      return res.status(400).json({ error: "Please provide all fields!" });
    }

    // Find user by ID
    const userData = await prisma.users.findFirst({
      where: {
        user_id: user_id,
      },
    });

    // Check if user exists
    if (!userData) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(
      current_password,
      userData.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Current password is incorrect!" });
    }

    // Check if new password matches confirm password
    if (password !== confirm_password) {
      return res.status(400).json({
        error:
          "Passwords do not match. Please ensure both password fields are identical.",
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user's password
    const updateUser = await prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Respond with success
    return res
      .status(200)
      .json({ message: "User password changed successfully!", updateUser });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUser,
  addUser,
  setActiveUser,
  setInActiveUser,
  allUserForMessage,
  updateUserRole,
  editUser,
  NoOfActiveUser,
  changePassword,
};
