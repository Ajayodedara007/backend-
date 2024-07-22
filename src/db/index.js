import mongoose from "mongoose"
import {DB_NAME} from '../constant.js'
import dotenv from 'dotenv';

dotenv.config({
     path:"./.env"
});


const connectDB = async () =>{
    try {
      const connectionInstance  =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
      console.log(`mongodb connect and db host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error",error)
        process.exit(1)
    }
}

export default connectDB;