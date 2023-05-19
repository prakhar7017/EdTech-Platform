const mongoose=require("mongoose");

const courseSchema=new mongoose.Schema({
    courseName:{
        type:String,
        trim:true,
        required:true,
    },
    courseDescription:{
        type:String,
        required:true,
        trim:true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    whatYouWillLearn:{
        type:String,
        required:true,
        trim:true,
    },
    courseContent:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Section"
    }],
    ratingAndReviews:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"RatingAndReview"
    },
    price:{
        type:Number,
        required:true,
        trim:true,
    },
    thumbnail:{
        type:String,
    },
    tags:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag"
    },
    studentEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    }]

})

module.exports=mongoose.model("Course",courseSchema);