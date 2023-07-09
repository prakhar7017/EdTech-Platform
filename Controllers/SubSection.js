const SubSection=require("../Models/SubSections");
const Section=require("../Models/Section");
const uplodeToCloudinary=require("../util/imageUploder");

exports.createSubSection=async (req,res)=>{
    try {
        const {title,description,sectionId}=req.body;
        console.log(title,description,sectionId);

        const video=req.files.video;

        if(!title ||  !description || !sectionId || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const uploadVideo=await uplodeToCloudinary.uploadImageToCloud(video,process.env.FOLDER_NAME);

        const subSectionDetails=await SubSection.create({
            title:title,
            timeDuration:`${uploadVideo.duration}`,
            description:description,
            videoUrl:uploadVideo.secure_url,
        })

        const updateSection=await Section.findByIdAndUpdate({_id:sectionId},{$push:{subSection:subSectionDetails._id}},{new:true}).populate("subSection");

        return res.status(201).json({
            message:"SubSection created SuccessFully",
            success:true,
            data:updateSection
        })
    } catch (error) {
      console.log(error)
        return res.status(500).json({
            success:false,
            message:"Unable to add SubSection"
        })
    }
}

exports.updateSubSection=async(req,res)=>{
    try {
        const {subSectionId,title,description,sectionId}=req.body;

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
            const uplaodDetails=await uplodeToCloudinary.uploadImageToCloud(video,process.env.FOLDER_NAME);
            subSection.videoUrl=uplaodDetails.secure_url;
            subSection.timeDuration=uplaodDetails.duration
        }

        await subSection.save();

        const updatedSection=await Section.findById(sectionId).populate("subSection");

        return res.status(200).json({
            success: true,
            data:updatedSection,
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

        const updatedSection=await Section.findById(sectionId).populate("subSection");
    
        return res.json({
          success: true,
          data:updatedSection,
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