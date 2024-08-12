const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const transporter = require("../config/nodeMailerConfig");
const { getIo } = require("../socket");
const OTPmail = require("../mail/OTP.sekeleton");

const addUserAndActivate = async (user_name, user_email, department, user_id, res) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      //Add a new user to the user pool
      const addNewUser = await prisma.userPool.create({
        data: {
          user_name: user_name,
          user_email: user_email,
          department: department,
          status: false,
          verified: false,
        },
      });

      //Activate the user and move them to the 'users' table

      const checkUser = await prisma.userPool.findUnique({
        where: {
          userPoolId: Number(user_id),
        },
      });

      if (!checkUser) {
        throw new Error("User not found!");
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

      const userDetails = {
        user_name: newUser.user_name,
        user_email: newUser.user_email,
        role: "user",
      };

      //Send email to the user
      await transporter.sendMail({
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

      // Emit event in socket
      const io = getIo();
      if (io) {
        io.emit("activated_user", {
          message: userDetails,
          updated: updatedUser,
        });
        console.log("Emitted activated_user event:", userDetails);
      } else {
        console.error("Socket.IO instance is not available.");
      }

      // Fetch updated user data from userPool
      const updatedUserData = await prisma.userPool.findUnique({
        where: {
          userPoolId: Number(user_id),
        },
      });

      return { newUser, updatedUserData };
    });

    //transaction succeeds
    return res.status(200).json({
      message: "User added and activated successfully",
      user: result.newUser,
      updatedUserData: result.updatedUserData,
    });

  } catch (error) {
    console.error("Transaction failed:", error);
    return res.status(500).json({ error: "Transaction failed", details: error.message });
  }
};

module.exports = { addUserAndActivate };
