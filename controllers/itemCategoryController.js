const prisma = require("../prismaClient");

//adding the itemCategory 
//assets - consumable - service 

const addItemCategory = async (req,res)=>{
    try{
        const {item_category_name} = req.body;
        if(!item_category_name){
        return res.status(501).json({error:"provide the necessary data!"});
        }
        const addData = await prisma.itemCategory.create({
            data: req.body
        });
        return res.status(201).json({message:"Successfully added the category !",addData});  
    }catch(error){
        return res.status(501).json({error:"Failed to add the item category"});
    }
}

const getItemCategory = async(req, res)=>{
    try{
        const allData = await prisma.itemCategory.findMany({});
        return res.status(201).json({allData});
    }catch(error){
        return res.status(501).josn({error:"failed to fetch all itemsCategories !"});
} 
}

module.exports={
    addItemCategory,
    getItemCategory
}