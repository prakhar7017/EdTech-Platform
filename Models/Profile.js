const mongoose=require("mongoose");

const profileSchema=new mongoose.Schema({
    gender:{
        type:String,
    },
    dateofBirth:{
        type:String,
        trim:true,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:Number,
        trim:true
    },
    profession:{
        type:String,
        trim:true,
    }
})

module.exports=mongoose.model("Profile",profileSchema);