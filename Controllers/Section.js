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

        const updateCourse=await Course.findByIdAndUpdate({_id:courseId},{$push:{courseContent:newSection._id}},{new:true}).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        });

        return res.status(201).json({
            success:true,
            message:"Section is Created SuccessFully",
            updateCourse
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to Create Section",
            error:error.message
        })
    }
}

exports.updateSection=async (req,res)=>{
    try {
        const {sectionName,sectionId,courseId}=req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const section=await Section.findByIdAndUpdate({_id:sectionId},{sectionName:sectionName},{new:true});

        const course=await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec();

        return res.status(200).json({
            success:true,
            message:"secction updated Successfully",
            data:course
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to Update Section",
            error:error.message
        })
    }
}

exports.deleteSection=async (req,res)=>{
    try {
        const {sectionId,courseId}=req.body;
        if(!sectionId){
            return res.status(400).json({
                success:false,
                message:"SectionId is missing"
            })
        }
        const deleteSection=await Section.findByIdAndDelete({_id:sectionId},{new:true})

        await Course.findByIdAndUpdate({_id:courseId},{$pull:{courseContent:sectionId}})

        const updatedCourse=await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec();
        
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
            data:updatedCourse
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to Delete Section",
            error:error.message
        })
    }
}