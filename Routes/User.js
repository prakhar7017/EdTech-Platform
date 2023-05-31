const express=require("express");
const router=express.Router();
const auth_controller=require("../Controllers/Auth");
const reset_controller=require("../Controllers/ResetPassword");
const auth_middleware=require("../Middlewares/Auth");

router.post("/login",auth_controller.postLogin);

router.post("/signup",auth_controller.postSignup);

router.post("/sendotp",auth_controller.sendOTP);

router.post("/changepassword",auth_controller.postChangePassword);

router.post("/reset-password-token",reset_controller.resetPasswordToken);

router.post("/reset-password",reset_controller.resetPassword);

module.exports=router;