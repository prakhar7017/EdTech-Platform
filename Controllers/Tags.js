const Tag=require("../Models/Tag");


exports.createTag=async (req,res)=>{
    try {
        const {name,description}=req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const tagDetails=await Tag.create({
            name:name,
            description:description
        });

        console.log(tagDetails);

        res.status(201).json({
            success:true,
            message:"Tag created Successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllTags=async(req,res)=>{
    try {
        const allTags=await Tag.find({},{name:true,description:true});

        res.status(200).json({
            success:true,
            message:"all tags returned",
            allTags
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}