const Razorpay=require("razorpay");
const instance=require("../Configs/Razorpay");

exports.CreateOrder=async(amount,courseid,userid)=>{
    const options={
        amount:amount*100,
        currency:"INR",
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:courseid,
            userId:userid,
        }
    }
    try {
        const paymentResponse=await instance.orders.create(options);
        return paymentResponse;
    } catch (error) {
        return error;
    }
}