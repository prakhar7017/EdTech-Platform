const express=require("express");
const router=express.Router();
const payment_controller=require("../Controllers/Payments");
const auth_middleware=require("../Middlewares/Auth");

router.post("/capturePayment",auth_middleware.isAuthenticated,auth_middleware.isStudent,payment_controller.capturePayment)

router.post("/verifyPayment",auth_middleware.isAuthenticated,auth_middleware.isStudent,payment_controller.verifyPayment)

router.post("/sendPaymentSuccessEmail",auth_middleware.isAuthenticated,auth_middleware.isStudent,payment_controller.sendPaymentSuccessEmail)

module.exports=router;