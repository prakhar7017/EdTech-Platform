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
    try {
        const {subSectionId,title,description}=req.body;

        const subSection=await SubSection.findById({_id:subSectionId});

        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
              })
        }
        if(title !== undefined){
            subSection.title=title;
        }
        if(description !== undefined){
            subSection.description=description;
        }
        if(req.files && req.files.video !== undefined){
            const video=req.files.video;
            const uplaodDetails=await uplodeToCloudinary(video,process.env.FOLDER_NAME);
            subSection.videoUrl=uplaodDetails.secure_url;
            subSection.timeDuration=uplaodDetails.duration
        }

        await subSection.save();

        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
          })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
          })
    }

}

exports.deleteSubSection=async(req,res)=>{
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
          { _id: sectionId },
          {
            $pull: {
              subSection: subSectionId,
            },
          }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
    
        if (!subSection) {
          return res
            .status(404)
            .json({ success: false, message: "SubSection not found" })
        }
    
        return res.json({
          success: true,
          message: "SubSection deleted successfully",
        })
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the SubSection",
        })
      }
}