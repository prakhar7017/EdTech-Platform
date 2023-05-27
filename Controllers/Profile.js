const Profile=require("../Models/Profile")
const User=require("../Models/Users");

exports.updateProfile=async (req,res)=>{
     try {
        const {gender="",DOB="",about="",contactNumber="",profession=""}=res.body;

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
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById({_id:profileId});

        profileDetails.gender=gender;        
        profileDetails.dateofBirth=DOB;        
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
            message:"unable to delete Profile",
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

        await Profile.findByIdAndDelete({_id:userId.additionalDetails})

        await User.findByIdAndDelete({_id:userId});

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"account deletion failed"
        })
    }
}