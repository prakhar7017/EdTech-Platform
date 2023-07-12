const Course=require("../Models/Course");
const Category=require("../Models/Category");
const User=require("../Models/Users");
const Section=require("../Models/Section");
// const SUBSection=require("../Models/SubSections");
const SubSection=require("../Models/SubSections");
const CourseProgress=require("../Models/CourseProgress");
const uploadImageToCloud=require("../util/imageUploder");


exports.createCourse=async (req,res)=>{
    try {
        
        let {courseName,courseDescription,whatYouWillLearn,price,tag:_tag,category,status,instructions:_instructions}=req.body;
    
        
        const thumbNail=req.files.thumbnailImage;
        
        const tag=JSON.parse(_tag);
        const instructions=JSON.parse(_instructions);


        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbNail || !category || !instructions.length){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        
        if (!status || status === undefined) {
			status = "Draft";
		}
        const userId=req.user.id;
        const instructorDetails=await User.findById({_id:userId},{accountType:"Instructor"});
        
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Not Found"
            })
        }
        const categoryDetails=await Category.findById({_id:category});

        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category Not Found"
            })
        }
        
        const uploadImage=await uploadImageToCloud.uploadImageToCloud(thumbNail,process.env.FOLDER_NAME);

        const newCourse=await Course.create({
            courseName:courseName,
            courseDescription:courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price:price,
            thumbnail:uploadImage.secure_url,
            tags:tag,
            category:categoryDetails._id,
            status:status,
            instructions:instructions

        })
        
        //add the course to userSchema
        await User.findByIdAndUpdate({_id:instructorDetails._id},{$push:{courses:newCourse._id}},{new:true});
        
        // add course in Tag schema 
        await Category.findByIdAndUpdate({_id:categoryDetails._id},{$push:{course:newCourse._id}},{new:true});
        
        return res.status(201).json({
            success:true,
            message:"Course created Successfully",
            data:newCourse
        })
        
    } catch (error) {
        console.log(`error in course creation ${error}`)
        return res.status(500).json({
            success:false,
            message:"failed to create Course"
        })
    }
}

exports.getAllCourse=async(req,res)=>{
    try {
        const allCourse=await Course.find({},{courseName:true,
            instructor:true,
            price:true,
            thumbnail:true,
            tags:true,
            ratingAndReviews:true,
            studentEnrolled:true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success:false,
            message:"All Courses Fetched",
            data:allCourse
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"failed to Fetch Course",
            error:error.message
        })
    }
}

exports.getCourseDetails=async (req,res)=>{
    try {
        const {courseId}=req.body;
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Course Id not found"
            })
        }
        const courseDetails=await Course.find({_id:courseId}).populate({
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        }).populate("category").populate("ratingAndReviews").populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec();

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Could not found course"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Course founded Successfully",
            courseDetails
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"failed to get Course",
            error:error.message
        })
    }
}

exports.deleteCourse=async(req,res)=>{
    try {
        const {courseId}=req.body;
        const userId=req.user.id

        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Course Id not found"
            })
        }

        
        const course=await Course.findById(courseId).populate("courseContent").exec();
        console.log(course);
        const AllCourse=course.CourseContent;

        const delete_Section_subsection=AllCourse.map(async (sectionid)=>{
            const section=Section.findById(sectionid).populate("subSection").exec;

            const subsection=section.SubSection;

            subsection.map(async (element)=>{
                await SUBSection.findByIdAndDelete(element);
            })

            await Section.findByIdAndDelete(sectionid);
        })

        const deletedCourses= await User.findByIdAndUpdate(userId,{$pull:{courses:courseId}},{new:true});

        if(!deletedCourses){
            return res.status(400).json({
                success:false,
                message:"Unable to delete the Course"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Course Deleted Successfully",
            deletedCourses
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`Internal Server Error->${error}`
        })
    }
}

exports.updateCourse=async (req,res)=>{
    try {
        const {courseId}=req.body;
        const updates=req.body;
        const course=await Course.findById(courseId);

        // if(!updates){
        //     return res.status(404).json({
        //         success:false,
        //         message:"No Changed Made Yet..."
        //     })
        // }
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course does not exist"
            })
        }
    
        if(req.files && req.files.thumbnailImage){
            const thumbnail=req.files.thumbnailImage;
            const thumbnailImage=await uploadImageToCloud.uploadImageToCloud(thumbnail,process.env.FOLDER_NAME);
            
            course.thumbnail=thumbnailImage.secure_url;
        }
    
        for(let field in updates){
            if(updates.hasOwnProperty(field)){
                if(field==="tag" || field==="instructions"){
                    course[field]=JSON.parse(updates[field])
                }
            }else{
                course[field]=updates[field]
            }
        }
    
        await course.save();
    
        const updatedCourse=await Course.findById(courseId).populate({
            path:"instructor",
            populate:{
                path:"additionalDetails",
            }
        }).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).populate("category")
        .populate("ratingAndReviews").exec();
    
        return res.status(200).json({
            success:true,
            message:"Course Updated Successfully",
            data:updatedCourse
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to Update Course"
        })
    }
}

exports.getFullCourseDetails=async (req,res)=>{
    try {
        const {courseId}=req.body;
        const userId=req.user.id;
    
        const courseDetails=await Course.findById(courseId).populate({
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        }).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).populate("category").populate("ratingAndReviews").exec();
    
        const courseProgressCount=await CourseProgress.findOne({courseId:courseId});
    
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Cound not find the course"
            })
        }
    
        let totalDurationInSeconds=0;
        courseDetails?.courseContent?.forEach((content)=>{
            content?.subsection?.forEach((subSection)=>{
                const timeDurationInSeconds=parseInt(subSection?.timeDuration);
                totalDurationInSeconds+=timeDurationInSeconds;
            })
        })
    
        const totalDuration=convertSecondsToDuration(totalDurationInSeconds);
    
        return res.status(200).json({
            success:true,
            data:{
                courseDetails,
                totalDuration,
                completedVideos:courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos :[],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

exports.getInstructorCourse=async (req,res)=>{
    try {
        const instructorId=req.user.id;
        const instructorCourses=await Course.find({instructor:instructorId}).sort({createdAt:-1});

        if(!instructorCourses){
            return res.status(400).json({
                success:false,
                message:"Instructor Courses not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Instructor Courses found",
            data:instructorCourses
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}