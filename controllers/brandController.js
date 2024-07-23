const prisma = require("../prismaClient");


// Function to add a new brand
const addBrand = async (req, res) => {
  try {

      // Extracting brand_name from the request body
    const{brand_name} = req.body;

      // Checking if the brand already exists in the database
    const brandData = await prisma.brand.findFirst({
        where:{
            brand_name:brand_name
        }
    })

    // If the brand exists, compare names in uppercase to handle case sensitivity
    if (brandData){
        const reqBrand = brand_name.toUpperCase();
        const getBrand =  brandData.brand_name.toUpperCase();
        if (reqBrand== getBrand) {
            return res.status(301).json({
                error: "Brand Name already exists!"
            })
        } }

        // If the brand does not exist, create a new brand
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
          // Extracting brand ID from the request parameters
         const id = Number(req.params.id);

          // Checking if the brand exists in the database
        const getData = await prisma.brand.findUnique({
            where :{
                brand_id:id
            }
        })
        console.log(getData);

         // If the brand does not exist, send a not found response
        if (!getData ){
            return res.status(201).json({
                message:"Brand not found!"
             })
         }

            // If the brand exists, delete it from the database
         const brandData = await prisma.brand.delete({
             where :{
                 brand_id: id
             }
         })
 
         // Send success response after deletion
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