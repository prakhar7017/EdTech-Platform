const Section=require("../Models/Section");
const Course=require("../Models/Course");

exports.createSection=async (req,res)=>{
    try {
        const {sectionName,courseId}=req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Name is Required or course Id is not Found"
            })
        }

        const newSection =await Section.create({
            sectionName:sectionName,
        })

        const updateCourse=await Course.findByIdAndUpdate({_id:courseId},{$push:{courseContent:newSection._id}},{new:true});

        return res.status(201).json({
            success:true,
            message:"Section is Created SuccessFully",
            updateCourse
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to Create Section"
        })
    }
}