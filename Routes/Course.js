const express=require("express");
const router=express.Router();

const course_controller=require("../Controllers/Course");

const category_controller=require("../Controllers/Category");

const section_controller=require("../Controllers/Section");

const subsection_controller=require("../Controllers/SubSection");

const ratingandreview_controller=require("../Controllers/RatingandReview");

const auth_middleware=require("../Middlewares/Auth");

router.post("/createCourse",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.createCourse);

router.post("/editCourse",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.updateCourse);

router.delete("/deleteCourse",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.deleteCourse);


router.post("/addSection",auth_middleware.isAuthenticated,auth_middleware.isInstructor,section_controller.createSection)

router.post("/updateSection",auth_middleware.isAuthenticated,auth_middleware.isInstructor,section_controller.updateSection);

router.post("/deleteSection",auth_middleware.isAuthenticated,auth_middleware.isInstructor,section_controller.deleteSection);

router.post("/addSubSection",auth_middleware.isAuthenticated,auth_middleware.isInstructor,subsection_controller.createSubSection)

router.post("/updateSubSection",auth_middleware.isAuthenticated,auth_middleware.isInstructor,subsection_controller.updateSubSection);

router.post("/deleteSubSection",auth_middleware.isAuthenticated,auth_middleware.isInstructor,subsection_controller.deleteSubSection);

router.get("/getAllCourses",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.getAllCourse);

router.get("/getFullCourseDetails",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.getCourseDetails);

router.get("/getInstructorCourses",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.getInstructorCourse);

router.post("/getFullCourseDetails",auth_middleware.isAuthenticated,auth_middleware.isInstructor,course_controller.getFullCourseDetails);

router.post("/createCategory",auth_middleware.isAuthenticated,auth_middleware.isAdmin,category_controller.createCategory);

router.get("/showAllCategories",category_controller.getAllCategory);

router.get("/categoryPageDetails",auth_middleware.isAuthenticated,auth_middleware.isAdmin,category_controller.categoryPagedetails);


router.post("/createRating",auth_middleware.isAuthenticated,auth_middleware.isStudent,ratingandreview_controller.createRatingandReview)

router.get("/getAverageRating",ratingandreview_controller.getAverageRating);

router.get("/getReviews",ratingandreview_controller.getAllRandR)

module.exports=router;