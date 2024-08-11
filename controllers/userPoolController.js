const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const transporter = require("../config/nodeMailerConfig");

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

    console.log(user_id);

    const checkUser = await prisma.userPool.findUnique({
      where: {
        userPoolId: Number(user_id),
      },
    });

    if (!checkUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    const updateStatus = await prisma.userPool.update({
      where: {
        userPoolId: Number(user_id),
      },
      data: {
        status: true,
      },
    });

    const password = "resource@2024";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      user_name: checkUser.user_name,
      user_email: checkUser.user_email,
      password: hashedPassword,
      role: "user",
      status: false,
    };

    const signupUser = await prisma.users.create({
      data: {
        user_name: checkUser.user_name,
        user_email: checkUser.user_email,
        password: hashedPassword,
        role: "user",
        status: false,
      },
    });

    const info = await transporter.sendMail({
      from: "RTE Department <habit234pulse@gmail.com>",
      to: user.user_email,
      subject: "Important Notice!",
      // text: "Hello world?",
      html: `
      <p>Dear Shrey,</p>

      <p>I hope this message finds you well.</p>

      <p>We are pleased to inform you that you have been added to the user list of our resource website. You can now access the platform and explore the various resources available to you.</p>

      <h3>Account Details:</h3>
      <ul>
        
        <li><strong>Role:</strong> User</li>
      </ul>

      <h3>Next Steps:</h3>
      <p>For security reasons, your password has not been included in this email. To obtain your password, please contact the Resource Department Head directly.</p>

      <h3>Contact Information:</h3>
      <ul>
        <li><strong>Resource Department Head:</strong> Nikhil Shakya</li>
        <li><strong>Phone Number:</strong> 9823e23432</li>
      </ul>

      <p>Once you have your password, you can log in to the resource website and start utilizing the available tools and materials. And make sure you change your password after you login!</p>

      <p>If you have any questions or encounter any issues, please don't hesitate to reach out to us.</p>

      <p>Thank you, and we look forward to your active participation on the platform.</p>

      <p>Best regards,</p>

      <p>Nikhil Shakya<br>
      Resource Department Head<br>
      <br>
      </p>
    `,
    });

    await transporter.sendMail(info);

    return res
      .status(200)
      .json({ message: "User activated", user: signupUser });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};

module.exports = { addUser, getAllUsers, setUserActive };
