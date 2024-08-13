const prisma = require("../prismaClient");


const addDepartment = async(req,res)=>{
    const {department_name}= req.body;
    try {
        const department = await prisma.department.create({
            data:{
                department_name:department_name
            }
        })
        return res.status(200).json({ department: department});
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal Server Error !" });
    }
}

const getDepartment = async(req,res)=>{
    try {
        const data = await prisma.department.findMany({})
        return res.status(200).json({department:data});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal Server Error !" });
        }
        
    }

module.exports={
    addDepartment,
    getDepartment
}