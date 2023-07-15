const mongoose=require("mongoose");

const subSection=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true,
    },
    timeDuration:{
        type:String,
        trim:true,
        required:true,
    },
    description:{
        type:String,
        trim:true,
        required:true,
    },
    videoUrl:{
        type:String,
        trim:true,
        required:true,
    },
},{timestamps:true})

module.exports=mongoose.model("SubSection",subSection);