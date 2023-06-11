const express=require("express");
const router=express.Router();
const contactus_controller=require("../Controllers/ContactUS")


router.post("/reach/contact",contactus_controller.ContactUS);


module.exports=router