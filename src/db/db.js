import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

async function dbConnnect() {
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected successfully !! DB host : ${connectionInstance.connection.host}`)
    }catch(error){
        console.error("Error ki MKC :: MongoDB connection Failed : ",error);
        process.exit(1);
    }
}

export default dbConnnect