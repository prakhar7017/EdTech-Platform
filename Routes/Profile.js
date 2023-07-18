const express=require("express");
const router=express.Router();
const profile_controller=require("../Controllers/Profile");
const auth_middleware=require("../Middlewares/Auth");



router.delete("/deleteProfile",auth_middleware.isAuthenticated,profile_controller.deleteAccount)

router.put("/updateProfile",auth_middleware.isAuthenticated,profile_controller.updateProfile);

router.get("/getUserDetails",auth_middleware.isAuthenticated,profile_controller.getAllUserDetails);

router.put("/updateDisplayPicture",auth_middleware.isAuthenticated,profile_controller.updateDisplayPicture);

router.get("/getEnrolledCourses",auth_middleware.isAuthenticated,profile_controller.getEnrolledCourses)

router.get("/instructorDashboard",auth_middleware.isAuthenticated,auth_middleware.isInstructor,profile_controller.instructorDashboard)

module.exports=router;