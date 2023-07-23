const { default: mongoose } = require("mongoose");
const crypto=require("crypto");
const {instance}=require("../Configs/Razorpay");
const Course=require("../Models/Course");
const CreateOrder=require("../util/CreateOrder");
const User=require("../Models/Users");
const mailSender=require("../util/mailSender");
const Razorpay=require("razorpay");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const {paymentSuccessEmail} =require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../Models/CourseProgress");

exports.capturePayment=async (req,res)=>{

    const {courses}=req.body;

    const userId=req.user.id;

    if(courses.length===0){
        return res.status(404).json({
            success:false,
            message:"Please Add Atleast one course"
        })
    }

    let totalAmount=0;
     for(const course_id of courses){

        let course;
        try {
            course=await Course.findById(course_id);
            if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Could not find the course"
                })
            }

            const uid=new mongoose.Types.ObjectId(userId);
            if(course?.studentEnrolled?.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"Student is already Inrolled"
                })
            }

            totalAmount+=course?.price
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }

    const amount=totalAmount*100
    const currency="INR"
    const option={
        amount,
        currency,
        receipt:Math.random(Date.now()).toString(),
    }

    try {
        const paymentResponse=await instance.orders.create(option);
        return res.status(200).json({
            success:true,
            message:"Payemnt Captured Successfully",
            data:paymentResponse
        })
    } catch (error) {
        console.log(error); 
        return res.status(500).json({
            success:false,
            message:"Could not Initiate Order"
        })
    }

}

exports.verifyPayment=async (req,res)=>{
    const razorpay_order_id=req.body?.razorpay_order_id;
    const razorpay_payment_id=req.body?.razorpay_payment_id;
    const razorpay_signature=req.body?.razorpay_signature;
    const courses=req.body?.courses;
    const userId=req.user.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses ||!userId ){
        return res.status(400).json({
            success:false,
            message:"Payment Failed"
        })
    }

    let body=razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature=crypto.createHmac("sha256",process.env.KEY_SECRET).update(body.toString()).digest("hex");

    if(expectedSignature===razorpay_signature){
        await enrollStudent(courses,userId,res);
        return res.status(200).json({
            success:true,
            message:"Payment Verified"
        })
    }
    return res.status(400).json({
        success:false,
        message:'Payment failed'
    })
}
const enrollStudent=async (courses,userId,res)=>{
    try {
        if(!courses || !userId){
            return res.status(400).json({
                success:false,
                message:"Course or UserId not Found"
            })
        }
    
        for(const courseId of courses){
            const enrolledCourse=await Course.findByIdAndUpdate({_id:courseId},{$push:{studentEnrolled:userId}},{new:true});
    
            if(!enrolledCourse){
                return res.status(400).json({
                    success:false,
                    message:"course not found"
                })
            }

            const courseProgress=await CourseProgress.create({
                courseId:courseId,
                userId:userId,
                completedVideos:[]
            })


            const enrolledStudent=await User.findByIdAndUpdate({_id:userId},{
                $push:{
                courses:courseId,
                courseProgress:courseProgress._id
                }},{new:true});

            
    
            const emailResponse=await mailSender(enrolledStudent.email,`SuccessFully Enrolled into ${enrolledCourse.courseName}`,courseEnrollmentEmail(enrolledCourse.courseName,enrolledStudent.firstName+" "+enrolledStudent.lastName));
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}

exports.sendPaymentSuccessEmail=async(req,res)=>{
    const {orderId,paymentId,amount}=req.body;

    const userId=req.user.id;

    if(!orderId || !paymentId ||!amount){
        return res.status(400).json({
            success:false,
            message:"All Fields Are Required"
        })
    }

    try {
        const enrolledStudent=await User.findById(userId)

        await mailSender(enrolledStudent.email,paymentSuccessEmail(`${enrolledStudent.firstName}`,amount/100,orderId,paymentId));

        return res.status(200).json({
            success:true,
            message:"Payment Email Sent SuccessFully"
        })
 
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}
// exports.capturePayment=async(req,res)=>{
//     try {
//         const {courseId}=req.body;
//         const userId=req.user.id;
        
//         if(!userId){
//             return res.status(404).json({
//                 success:false,
//                 message:"User Id not found"
//             })
//         }
//         if(!courseId){
//             return res.status(404).json({
//                 success:false,
//                 message:"Course ID not found"
//             })
//         }
//         let course;
//         try {
//             course=await Course.findById({_id:courseId});
//             if(!course){
//                 return res.status(400).json({
//                     success:false,
//                     message:"Course not found"
//                 })
//             }
//         } catch (error) {
//             return res.status(500).json({
//                 success:false,
//                 message:"falied to fetch course details",
//                 error:error.message
//             })
//         }
//         //user id to obejctid
//         const uid=new mongoose.Types.ObjectId(userId);
//         if(course.studentEnrolled.includes(uid)){
//             return res.status(400).json({
//                 success:false,
//                 message:"Student is Already Inrolled"
//             })
//         }
//         const paymentResponse=CreateOrder(course.price,courseId,userId);
//         console.log(paymentResponse);
//         if(!paymentResponse){
//             return res.status(400).json({
//                 success:false,
//                 message:"failed to create order"
//             })
//         }

//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail:course.thumbnail,
//             orderId:paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success:false,
//             message:"failed to capture a payment",
//             error:error.message
//         })
//     }
// }

// exports.verifySignature=async(req,res)=>{
//     try {
//         const webHook="12345"
//         const signature=req.headers("x-razorpay-signature");

//         const crypt=crypto.createHmac("sha256",webHook);
//         crypt.update(JSON.stringify(req.body));
//         const digest=crypt.digest("hex");

//         if(signature===digest){
//             const {courseId,userId}=req.body.payload.payment.entity.notes;

//             const enrolledstudent=await User.findByIdAndUpdate({_id:userId},{$push:{courses:courseId}},{new:true});

//             if(!enrolledstudent){
//                 return res.status(400).json({
//                     success:false,
//                     message:"Student not found"
//                 })
//             }
//             const enrolledCourse=await Course.findByIdAndUpdate({_id:courseId},{$push:{studentEnrolled:userId}},{new:true});

//             if(!enrolledCourse){
//                 return res.status(400).json({
//                     success:false,
//                     message:"Course not found"
//                 })
//             }

//             const mailsend=await mailSender(enrolledstudent.email,"congratulations","successfully Inrolled");

//             return res.status(200).json({
//                 success:false,
//                 message:"signature verified"
//             })
//         }else{
//             return res.status(400).json({
//                 success:false,
//                 message:"verification failed"
//             })
//         }
        
//     } catch (error) {
//         return res.status(500).json({
//             success:false,
//             message:"verification not able"
//         })
//     }
// }