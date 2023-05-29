const { default: mongoose } = require("mongoose");
const instance=require("../Configs/Razorpay");
const Course=require("../Models/Course");
const CreateOrder=require("../util/CreateOrder");
const User=require("../Models/Users");
const mailSender=require("../util/mailSender");



exports.capturePayment=async(req,res)=>{
    try {
        const {courseId}=req.body;
        const userId=req.user.id;
        
        if(!userId){
            return res.status(404).json({
                success:false,
                message:"User Id not found"
            })
        }
        if(!courseId){
            return res.status(404).json({
                success:false,
                message:"Course ID not found"
            })
        }
        let course;
        try {
            course=await Course.findById({_id:courseId});
            if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Course not found"
                })
            }
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:"falied to fetch course details",
                error:error.message
            })
        }
        //user id to obejctid
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Student is Already Inrolled"
            })
        }
        const paymentResponse=CreateOrder(course.price,courseId,userId);
        console.log(paymentResponse);
        if(!paymentResponse){
            return res.status(400).json({
                success:false,
                message:"failed to create order"
            })
        }

        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"failed to capture a payment",
            error:error.message
        })
    }
}

exports.verifySignature=async(req,res)=>{
    try {
        const webHook="12345"
        const signature=req.headers("x-razorpay-signature");

        const crypt=crypto.createHmac("sha256",webHook);
        crypt.update(JSON.stringify(req.body));
        const digest=crypt.digest("hex");

        if(signature===digest){
            const {courseId,userId}=req.body.payload.payment.entity.notes;

            const enrolledstudent=await User.findByIdAndUpdate({_id:userId},{$push:{courses:courseId}},{new:true});

            if(!enrolledstudent){
                return res.status(400).json({
                    success:false,
                    message:"Student not found"
                })
            }
            const enrolledCourse=await Course.findByIdAndUpdate({_id:courseId},{$push:{studentEnrolled:userId}},{new:true});

            if(!enrolledCourse){
                return res.status(400).json({
                    success:false,
                    message:"Course not found"
                })
            }

            const mailsend=await mailSender(enrolledstudent.email,"congratulations","successfully Inrolled");

            return res.status(200).json({
                success:false,
                message:"signature verified"
            })
        }else{
            return res.status(400).json({
                success:false,
                message:"verification failed"
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"verification not able"
        })
    }
}