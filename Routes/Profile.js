const express=require("express");
const router=express.Router();
const profile_controller=require("../Controllers/Profile");
const auth_middleware=require("../Middlewares/Auth");



router.delete("/deleteProfile",profile_controller.deleteAccount)

router.put("/updateProfile",profile_controller.updateProfile);

router.get("/getUserDetails",profile_controller.getAllUserDetails);

router.get("/updateDisplayPicture",profile_controller)








module.exports=router;