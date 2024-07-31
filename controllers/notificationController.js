const prisma = require("../prismaClient")

const getNotification = async(req,res)=>{
try {
    const data = await prisma.notification.findMany({});
    
    return res.status(200).json({notification:data});
} catch (error) {
    console.log(error);
    return res.status(500).json({error:"failed to get the notification !"});
}
    
}

const updateNotification = async (req,res)=>{
   try {
     const id = Number(req.params.id);
     const {state} = req.body;
     const result = await prisma.notification.update({
         where:{
             notification_id: id
         },
         data:{
             state:  Boolean(state)
         }
     })
     return res.status(200).json({updateNotification});
    } catch (error) {
       return res.status(500).json({error:"failed to update the notification !"});
    
   }
}

module.exports={
    updateNotification,
    getNotification
}