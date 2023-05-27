const SubSection=require("../Models/SubSections");
const Section=require("../Models/Section");
const uplodeToCloudinary=require("../util/imageUploder");

exports.createSubSection=async (req,res)=>{
    try {
        const {title,duration,description,sectionId}=req.body;

        const video=req.files.videoFile;

        if(!title || !duration || !description || !sectionId || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const uploadVideo=await uplodeToCloudinary(video,process.env.FOLDER_NAME);

        const subSectionDetails=await SubSection.create({
            title:title,
            timeDuration:duration,
            description:description,
            videoUrl:uploadVideo.secure_url,
        })

        const updateSection=await Section.findByIdAndUpdate({_id:sectionId},{$push:{subSection:subSectionDetails._id}},{new:true}).populate("SubSection");

        return res.status(201).json({
            message:"SubSection created SuccessFully",
            success:true,
            updateSection
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to add SubSection"
        })
    }
}

exports.updateSubSection=async(req,res)=>{

}

exports.deleteSubSection=async(req,res)=>{
    
}