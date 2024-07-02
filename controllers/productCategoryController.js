const prisma = require("../prismaClient");

const addProductCategory = async(req,res)=>{
    try{
        const{product_category_name} = req.body;
        if(!product_category_name){
            return res.status(501).json({error:"provide the necessary data!"});
        }
        const addProdCategory = await prisma.productCategory.create({
            data:req.body
        })
        return res.status(201).json({message:"Successfully added the productCategory !", addProdCategory});
    }
    catch(error){
        return res.status(501).json({error:"Failed to add the product category !"});
    }
}

const getProductCategory = async(req,res)=>{
    try{
        const proCategory = await prisma.productCategory.findMany({});
        return res.status(200).json({proCategory});
    }catch(error){
        return res.status(501).json({error:"Failed to get the productCategory !"});
    }
}

const deleteProductCategory = async(req,res)=>{
    try{
        const delete_id = req.params.id;
        const deleteProCategory = await prisma.productCategory.delete({
            where:{
                product_category_id: Number(delete_id)
            }
        });
        return res.status(200).json({message:"successfully deleted the product category !"});
    }
    catch(error){
        return res.status(501).json({error:"Failed to delete the product category !"});

    }
}


module.exports = {
    addProductCategory,
    getProductCategory,
    deleteProductCategory
}