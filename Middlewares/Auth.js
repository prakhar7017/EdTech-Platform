const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../Models/Users");

//auth
exports.isAuthenticated=async (req,res,next)=>{
    try {
        const token=req.cookies.token || req.body.token || req.get("Authorization").split(" ")[1];
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is Missing"
            })
        }

        try {
            const decode=await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"token is invalid"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            succes:false,
            message :"internal server error"
        })
    }
}
//isStudent
exports.isStudent=async (req,res,next)=>{
    try {
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"Permisson Denied"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role Cannot be verified"
        })
    }
}
//isInstructor
exports.isInstructor=async (req,res,next)=>{
    try {
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"Permisson Denied"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role Cannot be verified"
        })
    }
}
//isAdmin
exports.isAdmin=async (req,res,next)=>{
    try {
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"Permisson Denied"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role Cannot be verified"
        })
    }
}