const User=require("../Models/Users");
const OTP=require("../Models/otp");
const otpGenerator = require('otp-generator') 

// sendOTP
exports.sendOTP=async(req,res)=>{
    try {
        const {email}=req.body;

        const user_ifPresent=await User.findOne({email:email});

        if(user_ifPresent){
            return res.status(401).json({
                success:false,
                message:"User already Registered"
            })
        }
        // otp generate
        let otp=otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
            digits:true,
        })
        console.log("otp generated: ",otp);

        const otp_ifPresent=await OTP.findOne({
            otp:otp
        })

        while(otp_ifPresent){
            otp=otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
                digits:true,
            });
            otp_ifPresent=await OTP.findOne({
                otp:otp
            })
        }

        const otp_doc=await OTP.create({
            email,
            otp,
        })
        console.log(otp_doc);

        res.status(200).json({
            success:true,
            message:"OTP Sent SuccessFully",otp
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Internal server Error",
        })
        
    }




}
// signup

// login

// changePassword 