const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const transporter = require("../config/nodeMailerConfig");
const { getIo } = require("../socket");

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

    const regex = /@iic\.edu\.np$/;
    if (!regex.test(user_email)) {
      return res.status(400).json({ error: "Email is invalid!" });
    }

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

const setUserActive = async (req, res) => {
  try {
    const user_id = req.params.id;

    // Find the user in userPool
    const checkUser = await prisma.userPool.findUnique({
      where: {
        userPoolId: Number(user_id),
      },
    });

    if (!checkUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Update user status in userPool
    const updatedUser = await prisma.userPool.update({
      where: {
        userPoolId: Number(user_id),
      },
      data: {
        status: true,
      },
    });

    // Generate hashed password
    const defaultPassword = "resource@2024";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create new user in 'users' table
    const newUser = await prisma.users.create({
      data: {
        user_name: checkUser.user_name,
        user_email: checkUser.user_email,
        password: hashedPassword,
        role: "user",
        status: false, // Assuming 'status' is required in the schema
      },
    });

    // Send email to the user
    const info = await transporter.sendMail({
      from: "Studet Service Department <habit234pulse@gmail.com>",
      // to: userDetails.user_email,
      to: `bantawasubin@gmail.com`,
      subject: "Important Notice!",
      html: `
  <p>Dear Kamesh,</p>
    
    <p>We are excited to inform you that you have been selected for our prestigious International Exposure Program to Thailand. You have been chosen along with four other outstanding students for this incredible opportunity.</p>
    
    <h3>Details of the Program:</h3>
    <ul>
        <li><strong>Destination:</strong> Thailand</li>
        <li><strong>Purpose:</strong> International Exposure and Cultural Experience</li>
        <li><strong>Cost:</strong> All expenses for the selected five students are fully covered by IIC.</li>
    </ul>
    
    <p>To proceed, please visit the college with your passport and other official documents by tomorrow. This will help us complete the necessary preparations and formalities for your participation in the program.</p>
    
    <h3>Action Required:</h3>
    <ul>
        <li><strong>Date:</strong> [Date: August 12, 2024]</li>
        <li><strong>Documents Needed:</strong> Passport, and any other relevant official documents</li>
    </ul>
    
    <p>This is a remarkable opportunity to broaden your horizons and gain invaluable international experience. We are confident that this program will be a rewarding experience for you.</p>
    
    <p>Congratulations once again on your selection! If you have any questions or need further assistance, please do not hesitate to contact us at <b>9708438154</b>.</p>
    
    <p>Best regards,</p>
    <p>SSD <br>
    Itahari International College<br>
    9708438154<br>
    </p>
      `,
    });

    // Emit event using Socket.IO if available
    const io = getIo();
    if (io) {
      io.emit("activated_user", {
        message: newUser,
        updated: updatedUser,
      });
    } else {
      console.error("Socket.IO instance is not available.");
    }

    // Fetch updated user data from userPool
    const updatedUserData = await prisma.userPool.findUnique({
      where: {
        userPoolId: Number(user_id),
      },
    });

    // Respond with success message, user details, and updated user data
    return res.status(200).json({
      message: "User activated",
      user: newUser,
      updatedUserData: updatedUserData,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};

module.exports = { addUser, getAllUsers, setUserActive };
