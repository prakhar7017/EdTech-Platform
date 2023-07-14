const express=require("express");
const router=express.Router();
const payment_controller=require("../Controllers/Payments");
const auth_middleware=require("../Middlewares/Auth");

router.post("/capturePayment",auth_middleware.isAuthenticated,auth_middleware.isStudent,payment_controller.capturePayment)

router.post("/verifySignature",payment_controller.verifyPayment)

router.post("/payment/sendPaymentSuccessEmail",auth_middleware.isAuthenticated,auth_middleware.isInstructor,payment_controller.sendPaymentSuccessEmail)

module.exports=router;