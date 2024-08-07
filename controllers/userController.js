const prisma = require("../prismaClient");

const getUser = async (req,res)=>{
    try {
    const allUser = await prisma.users.findMany({});
        return res.status(200).json({user: allUser});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Failed to get all the users !"});
    }
}
const activeUser =  async(req,res)=>{
    try {
        const user = await prisma.users.findMany({
            where:{
                status: true
            }
        })
        return res.status(200).json({user});

    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Failed to get active the users !"});

    }
}

module.exports={
    getUser,
    activeUser
}