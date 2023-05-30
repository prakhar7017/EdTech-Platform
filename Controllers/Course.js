const Course=require("../Models/Course");
const Category=require("../Models/Category");
const User=require("../Models/Users");
const uploadImageToCloud=require("../util/imageUploder");


exports.createCourse=async (req,res)=>{
    try {
        const {courseName,courseDescription,whatYouWillLearn,price,tag,category,status,instructions}=req.body;

        const thumbNail=req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbNail || !category){
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

        const categoryDetails=await Category.findById({_id:tag});

        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category Not Found"
            })
        }

        const uploadImage=await uploadImageToCloud(thumbNail,process.env.FOLDER_NAME);

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
        const allCourse=await Course.find({},{   courseName:true,
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
            message:"Course founded Successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"failed to get Course",
            error:error.message
        })
    }


}