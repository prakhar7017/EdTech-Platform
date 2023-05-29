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
            message:error.message
        })
    }
}