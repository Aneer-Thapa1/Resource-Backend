const prisma = require("../prismaClient");
const transporter = require("../config/nodeMailerConfig");
const bcrypt = require("bcrypt");

const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(email);

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: {
        user_email: email,
      },
    });

    if (!user) return res.status(400).json({ message: "User does not exist" });

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update the user with the hashed OTP
    await prisma.users.update({
      where: {
        user_email: email,
      },
      data: {
        otp: hashedOtp,
      },
    });

    // Send the OTP to the user's email
    await transporter.sendMail({
      to: email,
      subject: "Important: OTP Code for Verification",
      text: `
Dear User,

We have received a request to verify your identity. To complete the verification process, please use the One-Time Password (OTP) provided below.

**OTP Code:** ${otp}

Please note that this OTP code is valid for 1 minute only. If you did not request this OTP or believe it was sent to you in error, please disregard this message.

If you require any assistance, do not hesitate to contact our support team.

Thank you for your attention.

Best regards,
IIC Resource Department
  `,
    });

    // Set a timeout to clear the OTP after 1 minute
    setTimeout(async () => {
      console.log(`Clearing OTP for user ${email}`);
      try {
        await prisma.users.update({
          where: {
            user_email: email,
          },
          data: {
            otp: null,
          },
        });
        console.log(`OTP cleared for user ${email}`);
      } catch (updateError) {
        console.error(`Error clearing OTP for user ${email}:`, updateError);
      }
    }, 60000);

    res
      .status(200)
      .json({ message: "OTP sent to your email and will expire in 1 minute" });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ message: "An error occurred while requesting OTP" });
  }
};

const checkOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log(email, otp);
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: {
        user_email: email,
      },
    });

    if (!user) return res.status(400).json({ message: "User does not exist" });

    // Compare the provided OTP with the hashed OTP stored in the database
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear the OTP after successful validation
    await prisma.users.update({
      where: {
        user_email: email,
      },
      data: {
        otp: null,
      },
    });

    res.status(200).json({ message: "OTP validated successfully" });
  } catch (error) {
    console.error("Error checking OTP:", error);
    res.status(500).json({ message: "An error occurred while checking OTP" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: {
        user_email: email,
      },
    });

    if (!user) return res.status(400).json({ message: "User does not exist" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.users.update({
      where: {
        user_email: email,
      },
      data: {
        password: hashedPassword, // Ensure your user model has a password field
      },
    });

    // Optionally clear any other fields like OTP if needed
    await prisma.users.update({
      where: {
        user_email: email,
      },
      data: {
        otp: null,
      },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "An error occurred while changing the password" });
  }
};

module.exports = { requestOTP, checkOTP, changePassword };
