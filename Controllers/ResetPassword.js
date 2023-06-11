const User=require("../Models/Users");
const mailSender=require("../util/mailSender");
const crypto=require("crypto");
const bcrypt=require("bcrypt")

exports.resetPasswordToken=async (req,res)=>{
    try {
        const {email}=req.body;
        if(!email){
            res.status(403).json({
                success:false,
                message:"Email is Required",
            })
        }
        const userExist=await User.findOne({email});
        if(!userExist){
            res.status(400).json({
                success:false,
                message:"User not Found",
            })
        }
        const token=crypto.randomUUID();

        const updatedUser=await User.findOneAndUpdate({email},{token:token,resetPasswordExpire:Date.now()+5*60*1000},{new:true});

        const url=`http://localhost:3000/update-password/${token}`;

        await mailSender(email,"Password Reset Link",`Here is the Link:${url}`)

        return res.status(200).json({
            success:true,
            message:"Reset Password Email Sended",
            updatedUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

exports.resetPassword=async(req,res)=>{
    try {
        const {password,confirmPassword,token}=req.body;
        if(!token){
            return res.status(404).json({
                success:false,
                message:"Token Does not found",
            })
        }
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"New Password and Confirm Password Does not Match",
            })
        }

        const user=await User.findOne({token});

        if(!user){
            return res.status(403).json({
                success:false,
                message:"Invalid Token"
            })
        }

        if(user.resetPasswordExpire < Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token has been expired Generate a new Token"
            })
        }

        const newhashPassword=await bcrypt.hash(password,10);

        const updatedUser=await User.findOneAndUpdate({token},{password:newhashPassword},{new:true})

        return res.status(200).json({
            success:true,
            message:"Password Reset SuccessFully",
            updatedUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}
