const prisma = require("../prismaClient");
const { updateBill } = require("./billController");

const addDepartment = async (req, res) => {
  const { department_name } = req.body;

  if (!department_name) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  //check department
  const checkDepartment = await prisma.department.findFirst({
    where:{
      department_name: department_name
    }
  })

  if(checkDepartment) return res.status(402).json({error:"Department already exist !"});
  try {
    const department = await prisma.department.create({
      data: {
        department_name: department_name,
      },
    });
    return res.status(200).json({ department: department });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};

const getDepartment = async (req, res) => {
  try {
    const data = await prisma.department.findMany({});
    return res.status(200).json({ department: data });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};


const getissueDepartment = async (req, res) => {
  try {
    
    const data = await prisma.department.findMany({});

    
    const modifiedData = [
      ...data, 
      {
        department_id: 222,   
        department_name: "student", 
      }
    ];

    return res.status(200).json({ department: modifiedData });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};

const editDepartment = async (req,res)=>{
  try {
    const department_id = Number(req.params.id);
    const {department_name}= req.body;
    const checkDepartment = await prisma.department.findFirst({
      where:{
        department_id : department_id
      }
    });

    if(!checkDepartment) return res.status(402).json({error:"Department not found !"});

    const updateDepartment = await prisma.department.update({
      where:{
        department_id: department_id
      },
      data:{
        department_name:  department_name
      }
    });
    return res.status(200).json({message:"Department updated Successfully !"});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error !" })
  }
}

module.exports = {
  addDepartment,
  getDepartment,
  editDepartment,
  getissueDepartment
};
