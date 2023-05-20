const { exists } = require("../Models/Profile");
const User=require("../Models/Users");
const OTP=require("../Models/otp");
const otpGenerator = require('otp-generator');
const bcrypt=require("bcrypt"); 
const jwt=require("jsonwebtoken");
const Profile = require("../Models/Profile");

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
exports.postSignup=async (req,res)=>{
   try {
     //data fetch
     const {
        firstName,lastName,email,password,phoneNumber,accountType,confirmPassword,otp
    }=req.body;
    // data validate
    if(!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber || !otp){
        return res.status(403).json({
            success:false,
            message:"ALL fields are required"
        })
    }
    // 2 password match karlo
    if(password!==confirmPassword){
        return res.status(400).json({
            succes:false,
            message:"Password and Confirm Password Does not match"
        })
    }
    // check user already exists
    const existingUser=await User.findOne({email})

    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User Already exist"
        })
    }
    // find most recent otp
    const recentOtp=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp);
    // validate otp
    if(recentOtp!=otp){
        return res.status(400).json({
            succes:false,
            message:"Invalid OTP"
        })
    }else if(recentOtp.length==0){
        return res.status(400).json({
            succes:false,
            message:"OTP Not Found"
        })
    }
    // hash password
    const hashedPassword=await bcrypt.hash(10,password);
    if(!hashedPassword){
        return res.status(400).json({
            success:false,
            message:"Password Cannot be Hashed"
        })
    }
    // store in db
    const profileDetails=await Profile.create({
        gender:null,
        dateofBirth:null,
        about:null,
        contactNumber:null,
        profession:null
    })
    const user=await User.create({
        firstName,lastName,email,password:hashedPassword,phoneNumber,accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`

    })
    // respone
    return res.status(201).json({
        success:true,
        message:"User is Registered SuccessFully",
        user
    })
   } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
   }
}
// login
exports.postLogin=async(req,res)=>{
    try {
        // get data
        const {email,password}=req.body;
        // validate data
        if(!email ||!password){
            return res.status(403).json({
                success:true,
                message:"All Fields are Required"
            })
        }
        // user check exist or not
        const existUser=await User.findOne({email})
        if(!existUser){
            return res.status(401).json({
                success:false,
                message:"User Not Found"
            })
        }
        // password ko compare kar leya
        if(await !bcrypt.compare(password,existUser.password)){
            return res.status(401).json({
                success:false,
                message:"Email or Password is Wrong"
            })
        }
        // generate JWT token
        let payload={
            email:existUser.email,
            id:existUser._id,
            accountType:existUser.accountType
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h"
        })
        existUser.token=token;
        existUser.password=undefined;
        // response
        let option={
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true
        }
        res.cookie("token",token,option).status(200).json({
            success:true,
            token,
            existingUser,
            message:"logged in Successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}
// changePassword 
exports.postChangePassword=async(req,res)=>{
//     get data from req
//     get email,newpassword,oldpassword,confirmpassword,
//     validator
//     update pwd in Profile.db
//     send mail
//     return res
}