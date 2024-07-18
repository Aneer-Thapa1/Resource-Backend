const prisma = require("../prismaClient");

const senRequest = async (req,res)=>{
    try {
        const userId = req.user.id;
        const {item_name, quantity}=req.body;
        const itemData = await prisma.items.findFirst({
            where:{
                item_name:item_name
            }
        })
        if(!itemData){
            return res.status(500).json({ error: "iterm not found !" });

        }
        const requestData = await prisma.request.create({
            data:{
                request_item_name: item_name,
                request_quantity: parseInt(quantity),
                user_id: userId,
                item_id: itemData.item_id
            } 
        })
        console.log("user is " +userId);
        return res.status(200).json({ message: "Successfully Requested the items", requestData });
        
    } catch (error) {
        return res.status(500).json({ message: "failed to send the request !" });
    }
}

module.exports = {
    senRequest
}