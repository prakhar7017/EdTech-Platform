const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(console.log("Database Connected")).catch(error=>{
        console.log("error in db connection",error);
        throw error;
    })
}