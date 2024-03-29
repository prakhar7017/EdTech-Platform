const mongoose=require("mongoose");
const mailSender = require("../util/mailSender");
const mailTemplate=require("../mail/templates/emailVerificationTemplate");

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        trim:true,
        required:true,
    },
    otp:{
        type:String,
        required:true,
        trim:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:60*5
    }
});

async function sendVerification(email,otp){
    try {
        const mailsend=await mailSender(email,"Verification Email From StudyNotion",mailTemplate(otp))
    } catch (error) {
        console.log("error occured in sending mail",error);
        throw error;
    }
}

otpSchema.pre("save",async function(next){
    if(this.isNew){
        await sendVerification(this.email,this.otp);
    }
    next();
})

module.exports=mongoose.model("OTP",otpSchema);