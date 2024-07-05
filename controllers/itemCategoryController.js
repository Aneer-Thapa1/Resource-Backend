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
        const allData = await prisma.itemCategory.findMany({
            include: {items:true}
        });
        return res.status(201).json({allData});
    }catch(error){
        return res.status(501).josn({error:"failed to fetch all itemsCategories !"});
} 
}

const deleteItemCategory = async(req,res)=>{
    try{
        const cate_id = req.params.id;
        console.log(cate_id);
        const deleteData = await prisma.itemCategory.delete({
            where:{
                item_category_id : Number(cate_id)
            }
        })
        return  res.status(201).json({message:"successfully deleted the item category !"});
    }
    catch(error){
        return res.status(503).json({error:"failed to delete the category !"});
    }
}


module.exports={
    addItemCategory,
    getItemCategory,
    deleteItemCategory
}