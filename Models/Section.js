const mongoose=require("mongoose");

const sectionSchema=new mongoose.Schema({
    sectionName:{
        type:String,
        trim:true,
        required:true,
    },
    subSection:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"SubSection"
    }],
},{timestamps:true})

module.exports=mongoose.model("Section",sectionSchema);