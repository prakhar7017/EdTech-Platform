const {mailSender}=require(".././util/mailSender")

exports.ContactUS=async(res,res)=>{
    const {firstname,lastname="",email,phoneNo,message}=req.body;

    if(!firstname || !email || phoneNo || message){
        return res.status(400).json({
            success:false,
            message:"Please Provide All fields"
        })
    }

    const mailSendtoemail=await mailSender(email,"Acknowledgement","Thanks for contacting us our Support will contact you shortly")

    if(!mailSendtoemail){
        return res.status(400).json({
            success:false,
            message:"mail not send to user"
        })
    }

    const mailtoAdmin=await mailSender(process.env.Admin_Email,"Acknowledge",`from:${email} with ${message}`)

    if(!mailtoAdmin){
        return res.status(400).json({
            success:false,
            message:"mail not send to admin"
        })
    }

    res.status(200).json({
        success:true,
        message:"form submitted successfully"
    })
}