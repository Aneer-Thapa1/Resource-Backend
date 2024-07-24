const prisma = require("../prismaClient");

const getUser = async (req,res)=>{
    try {
    const allUser = await prisma.users.findMany({});
        return res.status(200).json({user: allUser});
    } catch (error) {
        console.log(error);
        return res.status(301).json({error:"Failed to get all the users !"});
    }
}

module.exports={
    getUser
}