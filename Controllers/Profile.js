const Profile=require("../Models/Profile")
const User=require("../Models/Users");
const Course=require("../Models/Course");
const uplaodToCloudinary=require("../util/imageUploder");

exports.updateProfile=async (req,res)=>{
     try {
        const {gender="",dateOfBirth="",about="",contactNumber="",profession=""}=req.body;

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

        profileDetails.gender=gender;        
        profileDetails.dateofBirth=dateOfBirth;        
        profileDetails.about=about;        
        profileDetails.contactNumber=contactNumber;        
        profileDetails.profession=profession;     
        
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:"Profile Updated SuccessFully",
            profileDetails
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

        const profile=await Profile.findByIdAndDelete({_id:userExist.additionalDetails});
        // await Course.findByIdAndDelete({})
        // hw to detele course s
        const allEnrolledCourses=await User.findById({_id:userId}).select("courses");
        console.log(allEnrolledCourses.courses);
        allEnrolledCourses.courses.forEach(async (element) => {
            await Course.findByIdAndUpdate({_id:element},{$pull:{studentEnrolled:userId}})
        });
        await User.findByIdAndDelete({_id:userId});
        return res.status(200).json({
            succes:true,
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
        const displayPicture=req.files.displayPicture;
        const userId=req.user.id;
        const image=await uplaodToCloudinary.uploadImageToCloud(displayPicture,process.env.FOLDER_NAME,1000,1000)

        const updateProfile=await User.findByIdAndUpdate({_id:userId},{image:image.secure_url},{new:true});
        console.log(updateProfile)

        return res.status(200).json({
            success:true,
            message:"Profile Picture Update Successfully",
            updateProfile
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

exports.getEnrolledCourses=async (req,res)=>{
    try {
        const userId=req.user.id;
        const allCourses=await User.findOne({_id:userId}).populate("course").select("course").exec();

        if(!allCourses){
            return res.status(400).json({
                success:false,
                message:"cannot get enrolled courses"
            })
        }

        return res.status(200).json({
            success:false,
            message:"enrolled courses fetched successfully",
            allCourses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}