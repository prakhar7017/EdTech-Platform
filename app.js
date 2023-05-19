require("dotenv").config();
const express=require("express");
const PORT=process.env.PORT || 8000;
const db=require("./Configs/Database");
const app=express();


app.use(express.json());


app.listen(PORT,()=>{
    db.connect();
    console.log(`Server has Started Running on ${PORT}`);
})