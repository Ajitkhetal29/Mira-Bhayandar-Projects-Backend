import mongoose from "mongoose";
import "./loadEnv.js";
import { backfillMissingProjectSlugs } from "../utils/projectSlug.js";

const connectDb= async ()=>{
   try {
    await mongoose.connect(`${process.env.MONGO_URI}`)
    console.log("Database connected");
    await backfillMissingProjectSlugs();
   } catch (error) {
    console.log(error);
   }
}

export default connectDb;

