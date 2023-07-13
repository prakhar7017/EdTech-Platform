const Category=require("../Models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}



exports.createCategory=async (req,res)=>{
    try {
        const {name,description}=req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const categoryDetails=await Category.create({
            name:name,
            description:description
        });

        console.log(categoryDetails);

        res.status(201).json({
            success:true,
            message:"Category created Successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllCategory=async(req,res)=>{
    try {
        const allCategory=await Category.find({},{name:true,description:true});

        res.status(200).json({
            success:true,
            message:"all Category returned",
            allCategory
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"failed to fetch all category",
            error:error.message
        })
    }
}

exports.categoryPagedetails=async (req,res)=>{
    try {
        const {categoryId}=req.body;

        const selectedCategoryCourse=await Category.findById(categoryId).populate({
            path:"course",
            match:{status:"Published"},
            populate:{
                path:"ratingAndReviews"
            }

        }).exec();
        // console.log(selectedCategoryCourse);


        if(!selectedCategoryCourse){
            return res.status(404).json({
                success:false,
                message:"Category Not Found"
            })
        }

        if(selectedCategoryCourse?.course?.length===0){
            return res.status(404).json({
                success:false,
                message:"No Courses Found For Selected Category "
            })
        }

    
        const categoriesExcludedSelected=await Category.find({_id:{$ne:categoryId}});

        const differentCategory=await Category.findOne(
            categoriesExcludedSelected[getRandomInt(categoriesExcludedSelected.length)]
              ._id
          )
            .populate({
              path: "course",
              match: { status: "Published" },
            })
            .exec()


        const allCategories=await Category.find().populate({
            path:"course",
            match:{status:"Published"},
            populate:{
                path:"instructor"
            }
        }).exec();

        // console.log(allCategories);
        
        const allCourse=allCategories.flatMap((category)=>category?.course);
        // console.log(allCourse);
        const mostSellingCourse=allCourse.sort((a,b)=>b.sold-a.sold).slice(0,10);
        // console.log(mostSellingCourse);
        return res.status(200).json({
            success:false,
            message:"CategoriesDetails Founded Successfully",
            data:{
                selectedCategoryCourse,
                differentCategory,
                mostSellingCourse
            }
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
} 