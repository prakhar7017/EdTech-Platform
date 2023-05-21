const User=require("../Models/Users");
const mailSender=require("../util/mailSender");

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
            success:false,
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
// link generation and then resetPassword
// get email
// email exist and validate
// generate Token
// update user with adding Token and expiration
// create url
// send mail
// response
