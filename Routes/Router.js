const express=require("express");
const router=express.Router();

const User_router=require("./User");
const Profile_router=require("./Profile");
const Payment_router=require("./Payment");
const Course_router=require("./Course");
const ContactUS_router=require("./ContactUs")


router.use("/api/v1/auth",User_router)
router.use("/api/v1/profile",Profile_router)
router.use("/api/v1/payment",Payment_router)
router.use("/api/v1/course",Course_router)
router.use("/api/v1/reach",ContactUS_router)


module.exports=router;



