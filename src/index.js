import dotenv from "dotenv"
import dbConnnect from "./db/db.js"
import {app} from "./app.js"

dotenv.config({
    path: "./.env",
})

const port = process.env.PORT || 8000;

dbConnnect()
.then(()=>{
    app.listen(port,()=>{
        console.log(`App is listening on port : ${port}`)
    })
})
.catch((err)=>{
    console.log("Error ki MKC :: MongoDB connection Failed : ",err);
})



// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"
// import express from "express"

// const app=express();

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("err",(error){
//             console.error("err",error);
//             throw error;
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port : ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("ERROR ki MKC : ",error);
//         throw error;
//     }
// })()