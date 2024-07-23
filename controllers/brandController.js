const prisma = require("../prismaClient");

const addBrand = async (req, res) => {
  try {
    const{brand_name} = req.body;
    const brandData = await prisma.brand.findFirst({
        where:{
            brand_name:brand_name
        }
    })
    if (brandData){
        const reqBrand = brand_name.toUpperCase();
        const getBrand =  brandData.brand_name.toUpperCase();
        if (reqBrand== getBrand) {
            return res.status(301).json({
                error: "Brand Name already exists!"
            })
        } }
    const addData = await prisma.brand.create({
      data: {
        brand_name : brand_name
      }
    });
    return res.status(201).json({
    message: "Brand added successfully!",
      brand: addData,
      
    });
  } catch (error) {
    console.log(error);
    return res.status(301).json({
      error: "failed to add brand!"
    });

  }
};

const deleteBrand = async (req, res) =>
    {
       try {
         const id = Number(req.params.id);
        const getData = await prisma.brand.findUnique({
            where :{
                brand_id:id
            }
        })
        console.log(getData);
        if (!getData ){
            return res.status(201).json({
                message:"Brand not found!"
             })
         }

         const brandData = await prisma.brand.delete({
             where :{
                 brand_id: id
             }
         })
 
         return res.status(201).json({
            message:"Brand successfully deleted!"
         })
       } catch (error) {
        console.log(error);
        return res.status(301).json({
            error:"Failed to delete brand!"
        })
        
       }
}
module.exports={addBrand, deleteBrand}