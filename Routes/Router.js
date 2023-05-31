const express=require("express");
const router=express.Router();

const User_router=require("./User");
const Profile_router=require("./Profile");
const Payment_router=require("./Payment");
const Course_router=require("./Course");


router.use("/",User_router)
router.use("/",Profile_router)
router.use("/",Payment_router)
router.use("/",Course_router)


module.exports=router;



