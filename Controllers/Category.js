const Category=require("../Models/Category");


exports.createCategory=async (req,res)=>{
    try {
        const {name,description}=req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const categoryDetails=await Category.create({
            name:name,
            description:description
        });

        console.log(categoryDetails);

        res.status(201).json({
            success:true,
            message:"Category created Successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllCategory=async(req,res)=>{
    try {
        const allCategory=await Category.find({},{name:true,description:true});

        res.status(200).json({
            success:true,
            message:"all Category returned",
            allCategory
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"failed to fetch all category",
            error:error.message
        })
    }
}

exports.categoryPagedetails=async (req,res)=>{
    try {
        const {categoryId}=req.body;

        const selectedCategory=await Category.findById({_id:categoryId}).populate("course").exec();

        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"data not found"
            })
        }

        const differentCategory=await Category.find({_id:{$ne:categoryId}}).populate("course").exec();

        // const topSelling 

        return res.status(200).json({
            success:true,
            message:"all data fetched successfully",
            data:{
                selectedCategory,
                differentCategory
            }

        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"failed to fetch category page datails",
            error:error.message
        })
    }
}