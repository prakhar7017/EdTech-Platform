const express=require("express");
const router=express.Router();
const contactus_controller=require("../Controllers/ContactUS")


router.post("/contact",contactus_controller.ContactUS);


module.exports=router