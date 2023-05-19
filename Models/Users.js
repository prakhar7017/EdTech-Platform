const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    },
    accountType:{
        type:String,
        required:true,
        enum:["Admin","Student","Instructor"]
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required:true,
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }],
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgres"
    }],
})

module.exports=mongoose.model("User",UserSchema);