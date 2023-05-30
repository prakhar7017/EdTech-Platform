const RandR=require("../Models/RatingAndReview");
const User=require("../Models/Users");
const Course=require("../Models/Course");
const { default: mongoose } = require("mongoose");


exports.createRatingandReview=async(req,res)=>{
    try {
        const userId=req.user.id
        const {rating,review,courseId}=req.body;

        const courseDetails=await Course.findOne({_id:courseId,studentEnrolled:{$elemMatch:{$eq:userId}}})

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"User is Not Inrolled In this Course"
            })
        }

        const alreadyReviwed=await RandR.findOne({user:userId,course:courseId});

        if(alreadyReviwed){
            return res.status(403).json({
                success:false,
                message:"Already Reviewed the Course"
            })
        }

        const ratingAndreview=await RandR.create({user:userId,rating:rating,review:review,course:courseId});

        const updateCourse=await Course.findByIdAndUpdate({_id:courseId},{$push:{ratingAndReviews:ratingAndreview._id}},{new:true})

        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully"
        })
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:"failed to create rating and review",
            error:error.message
        })
    }
}

exports.getAverageRating=async (req,res)=>{
    try {
        const {courseId}=req.body;

        const result=await RandR.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        if(result.length==0){
            return res.status(200).json({
                success:true,
                message:"0,No rating till now",
                averageRating:0,
            })
        }
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:"failed to get average Rating",
            error:error.message
        })
    }
}