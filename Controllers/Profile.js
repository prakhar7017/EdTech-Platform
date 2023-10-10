const Profile=require("../Models/Profile")
const User=require("../Models/Users");
const Course=require("../Models/Course");
const {uploadImageToCloud}=require("../util/imageUploder");
const {convertSecondsToDuration} =require("../util/SecondsToDurationConverter");
const CourseProgress = require("../Models/CourseProgress");

exports.updateProfile=async (req,res)=>{
     try {
        const {gender="",dateOfBirth="",about="",contactNumber="",profession="",firstName="",lastName=""}=req.body;

        const userId=req.user.id;

        if(!contactNumber || !gender){
            return res.status(400).json({
                success:false,
                message:"Gender and contact Number is required"
            })
        }
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"User Id not found"
            })
        }

        const userDetails=await User.findById({_id:userId});
        const profileid=userDetails.additionalDetails;
        const profileDetails=await Profile.findById({_id:profileid});

        const user=await User.findByIdAndUpdate(userId,{firstName:firstName,lastName:lastName},{new:true});

        profileDetails.gender=gender;        
        profileDetails.dateofBirth=dateOfBirth;        
        profileDetails.about=about;        
        profileDetails.contactNumber=contactNumber;        
        profileDetails.profession=profession;     
        
        await profileDetails.save();

        const updatedProfile=await User.findById({_id:userId}).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"Profile Updated SuccessFully",
            updatedProfile
        })
     } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to update Profile",
            error:error.message
        })
     }
}

exports.deleteAccount=async(req,res)=>{
    try {
        const userId=req.user.id;
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"User id is not Found"
            })
        }

        const userExist=await User.findById({_id:userId});
        if(!userExist){
            return res.status(404).json({
                success:false,
                message:"User does not Exist "
            })
        }

        await Profile.findByIdAndDelete({_id:new mongoose.Types.ObjectId(userExist.additionalDetails)});
        // await Course.findByIdAndDelete({})
        // hw to detele course s
        // const allEnrolledCourses=await User.findById({_id:userId}).select("courses");
        // allEnrolledCourses.courses.forEach(async (element) => {
        //     await Course.findByIdAndUpdate({_id:element},{$pull:{studentEnrolled:userId}})
        // });

        for(const courseId of userExist.courses){
            const course=await Course.findOneAndUpdate(courseId,{$pull:{studentEnrolled:userId}},{new:true});
        }
        await User.findByIdAndDelete({_id:userId});
        return res.status(200).json({
            success:true,
            message:"account deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"account deletion failed"
        })
    }
}

exports.getAllUserDetails=async (req,res)=>{
    try {
        const userId=req.user.id;
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"User id is not Found"
            })
        }

        const userDetails=await User.findById({_id:userId}).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"User Data Fetched",
            data:userDetails,
        })

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"fetching user details failed"
        })
    }
}
exports.updateDisplayPicture=async (req,res)=>{
    try {
        if(!req.files){
            return res.status(400).json({
                success:false,
                message:"no file were uploaded"
            })
        }
        const displayPicture=req.files.displayPicture;
        const userId=req.user.id;
        const image=await uploadImageToCloud(displayPicture,process.env.FOLDER_NAME,1000,1000)

        const updateProfile=await User.findByIdAndUpdate({_id:userId},{image:image.secure_url},{new:true});

        return res.status(200).json({
            success:true,
            message:"Profile Picture Update Successfully",
            updateProfile
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

exports.getEnrolledCourses=async (req,res)=>{
    try {
        const userId=req.user.id;
        let userDetails=await User.findOne({_id:userId}).populate({
            path:"courses",
            populate:{
                path:"courseContent",
                populate:{
                    path:"subSection"
                }
            }
        }).exec();

        userDetails=userDetails.toObject();
        let subSectionLength=0;
        for(let i=0;i<userDetails.courses.length;i++){
            let totalDurationInSeconds=0;
            subSectionLength=0;
            for (let j=0;j<userDetails.courses[i].courseContent.length;j++){
                totalDurationInSeconds +=userDetails.courses[i].courseContent[j].subSection.reduce((acc,curr)=>acc+parseInt(curr.timeDuration),0)
                userDetails.courses[i].totalDuration=convertSecondsToDuration(totalDurationInSeconds);
                subSectionLength += userDetails.courses[i].courseContent[j].subSection.length;
            }
            let courseProgressCount=await CourseProgress.findOne({
                courseId:userDetails.courses[i]._id,
                userId: userId,
            })
            courseProgressCount=courseProgressCount?.completedVideos.length
            if(subSectionLength===0){
                userDetails.courses[i].progressPercentage=100
            }else{
                const multiplier=Math.pow(10,2)
                userDetails.courses[i].progressPercentage=Math.round((courseProgressCount/subSectionLength)*100*multiplier)/multiplier
            }
        }

        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"cannot get enrolled courses"
            })
        }

        return res.status(200).json({
            success:true,
            message:"enrolled courses fetched successfully",
            data:userDetails.courses,
        })
        
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

exports.instructorDashboard=async(req,res)=>{
    try {
        const userId=req.user.id;

        const courseDetails=await Course.find({instructor:userId});

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"No Course Found"
            })
        }

        const statisticData=courseDetails?.map((course)=>{
            const totalStudent=course?.studentEnrolled?.length;
            const totalAmount=totalStudent*course.price;

            const data={
                _id:course._id,
                courseDescription:course?.courseDescription,
                courseName:course?.courseName,
                totalStudent,
                totalAmount
            }
            return data;
        })

        return res.status(200).json({
            success:true,
            message:"instructor Dashboard details fetched Successfully",
            data:statisticData
        })

    } catch (error) {
        return req.status(500).json({
            success:false,
            message:error.message
        })
    }

}