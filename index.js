require("dotenv").config();
const express=require("express");
const app=express();
const cookieParser = require('cookie-parser')
const cors=require("cors");
const fileUpload=require("express-fileupload");
const morgan=require("morgan");

const PORT=process.env.PORT || 8000;
const db=require("./Configs/Database");
const Routes=require("./Routes/Router");
const Cloudinary=require("./Configs/Cloudinary");



app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"*",
    methods: ["GET", "POST","PUT","DELETE","PATCH"],
    credentials:true,
}))
app.use(
	fileUpload({
		useTempFiles : true,
        tempFileDir : '/tmp/'
	})
)

app.use(Routes);

db.connect();
Cloudinary.cloudinaryConnect();

app.listen(PORT,()=>{
    // console.log(`Server has Started Running on ${PORT}`);
})