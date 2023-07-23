const CourseProgress = require("../Models/CourseProgress");
const SubSection = require("../Models/SubSections");

exports.updateCourseProgress=async(req,res)=>{

    const {courseId,subSectionId}=req.body;

    const userId=req.user.id;

    try {
        const subSection=await SubSection.findById(subSectionId);
        if(!subSection){
            return res.status(404).json({
                success:false,
                message:"SubSection Not Found "
            })
        }
        //check for old entry
        let courseProgress=await CourseProgress.findOne({
            courseId:courseId,
            userId:userId
        })
        if(!courseProgress){
            return res.status(404).json({
                success:false,
                message:"Course Progress Doest Not Exist"
            })
        }else{
            // check for re-completing videos
            if(courseProgress.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    success:false,
                    message:"SubSection is Already Marked Completed"
                })
            }

            courseProgress.completedVideos.push(subSectionId);
        }
        await courseProgress.save();

        return res.status(200).json({
            success:true,
            message:"Course Progress Updated Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}