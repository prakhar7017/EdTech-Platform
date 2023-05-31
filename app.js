require("dotenv").config();
const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
const cors=require("cors");
const fileUpload=require("express-fileupload");
const morgan=require("morgan");

const PORT=process.env.PORT || 8000;
const db=require("./Configs/Database");
const Routes=require("./Routes/Router");
const Cloudinary=require("./Configs/Cloudinary");



app.use(morgan("dev"));
app.use(express.json());
app.use(Routes);
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}))
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp"
}))

app.listen(PORT,()=>{
    db.connect();
    Cloudinary.cloudinaryConnect();
    console.log(`Server has Started Running on ${PORT}`);
})