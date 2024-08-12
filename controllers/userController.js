const prisma = require("../prismaClient");
const transporter = require("../config/nodeMailerConfig");
const { getIo } = require("../socket");
const newUserMail = require("../mail/newUser.skeleton");
const bcrypt = require("bcrypt");


const getUser = async (req, res) => {
  try {
    const allUser = await prisma.users.findMany({});
    return res.status(200).json({ user: allUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get all the users !" });
  }
};

const addUser = async (req,res)=>{
  const{user_email , user_name, department} = req.body;
  
if (!user_name || !user_email || !department) {
  return res.status(400).json({ error: "Please fill all the fields!" });
}
  try {


    const checkDepartment = await prisma.department.findFirst({
      where:{
        department_name: department
      }
    })

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

    if(!checkDepartment) return res.status(200).json({error:'department not found !'});


    const defaultPassword = 'rar@iicResource';
    const salt = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword,salt);

    const addUser = await prisma.users.create({
      data:{
          user_name: user_name,
        user_email: user_email,
          password: hashedPassword,
          department: {
            connect: { department_id: checkDepartment.department_id }
          }
      }
    })

    return res.status(200).json({message:"new user added successfully", newUser:addUser});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error !" });
  }
}

module.exports = {
  getUser,
  addUser,
};

