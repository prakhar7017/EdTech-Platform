require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const cluster = require("node:cluster");
const totalCPUs = require("node:os").cpus().length;
const PORT = process.env.PORT || 8000;
const db = require("./Configs/Database");
const Routes = require("./Routes/Router");
const Cloudinary = require("./Configs/Cloudinary");

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: "https://ed-tech-platform-frontend-n1ysptjwz-prakhar7017.vercel.app/",
      credentials: true,
    })
  );
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );
  
  // app.use("/",(req,res,next)=>{
  //   res.status(200).json({
  //     status:"success",
  //     message:"Backend is on"
  //   })
  //   next();
  // })

  app.use(Routes);

  app.listen(PORT, () => {
    db.connect();
    Cloudinary.cloudinaryConnect();
    // console.log(`Server has Started Running on ${PORT}`);
  });

  // console.log(`Worker ${process.pid} started`);
}
