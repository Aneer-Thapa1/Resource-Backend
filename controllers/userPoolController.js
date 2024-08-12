const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const transporter = require("../config/nodeMailerConfig");
const { getIo } = require("../socket");
const OTPmail = require("../mail/OTP.sekeleton");

// Add a new user to the user pool
const addUser = async (req, res) => {
  const { user_name, user_email, department } = req.body;

  if (!user_name || !user_email || !department) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  try {
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

    // Create a new user
    const addNewUser = await prisma.userPool.create({
      data: {
        user_name: user_name,
        user_email: user_email,
        department: department,
        status: false,
        verified: false,
      },
    });

    try {
      const otpResponse = await sendOTPVerificationEmail({
        id: addNewUser.userPoolId,
        email: user_email,
        user: user_name
      });
      return res.status(201).json({
        message: "User added successfully!",
        addNewUser,
        otpResponse,
      });
    } catch (error) {
      return res.status(500).json({
        message: "User added, but failed to send OTP email.",
        addNewUser,
        error: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// Get all users from the user pool
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

// Activate a user and move them to the 'users' table
const setUserActive = async (req, res) => {
  try {
    const user_id = req.params.id;

    // Find the user in the userPool
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
        status: false,
      },
    });


    // Send email to the user
    const info = await transporter.sendMail({
      from: "Student Service Department <habit234pulse@gmail.com>",
      to: userDetails.user_email,
      subject: "Important Notice!",
      html: `
        <p>Dear ${checkUser.user_name},</p>
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
        <p>SSD <br>Itahari International College<br>9708438154<br></p>
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

const sendOTPVerificationEmail = async ({ id, email,user }) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

   
    const updatedUser = await prisma.userPool.update({
      where: {
        userPoolId: id,
      },
      data: {
        otp: hashedOTP,
        created_at: new Date(),
        expire_at: new Date(Date.now() + 30000), // OTP expires in 1 hour
      },
    });

    const mailOptions = OTPmail(otp, email, user);

    await transporter.sendMail(mailOptions);

    return {
      status: "pending",
      message: "Verification OTP email sent",
      data: {
        userId: updatedUser.userPoolId,
        user_email: email,
      },
    };
  } catch (error) {
    console.error("An error occurred during OTP email sending:", error);
    throw new Error("Failed to send OTP email.");
  }
};

const verifyOTP = async (req, res) => {
  const { user_id, otp } = req.body;

  if (!user_id || !otp) {
    return res.status(400).json({ error: "User ID and OTP are required!" });
  }

  try {
    const user = await prisma.userPool.findUnique({
      where: {
        userPoolId: Number(user_id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const providedOTP = String(otp);
    const storedHash = String(user.otp);
    const currentTime = new Date();
    const otpExpireTime = user.expire_at;

    if (!providedOTP || !storedHash) {
      return res.status(400).json({ error: "Invalid OTP format!" });
    }

    if (currentTime > otpExpireTime) {
     await prisma.userPool.update({
        where: {
          userPoolId: Number(user_id),
        },
        data: {
         created_at:null,
          otp: null,
          expire_at: null,
        },
      });
   
      return res.status(400).json({ error: "OTP has expired!" });
    }

    const matchedOTP = await bcrypt.compare(providedOTP, storedHash);

    if (!matchedOTP) {
      return res.status(400).json({ error: "Invalid OTP!" });
    }

    const verifiedUser = await prisma.userPool.update({
      where: {
        userPoolId: Number(user_id),
      },
      data: {
        verified: true,
        otp: null,
        expire_at: null,
      },
    });

    return res.status(200).json({ message: "User OTP verified successfully!" });
  } catch (error) {
    console.error("An error occurred during OTP verification:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during OTP verification" });
  }
};

module.exports = { addUser, getAllUsers, setUserActive, verifyOTP };
