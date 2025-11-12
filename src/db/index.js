import mongoose  from "mongoose";

const connectDB=async()=>{
    try {
        const connectInstance=await mongoose.connect(`${process.env.MONGODB_URL}/yt-backend`);
        console.log("MONGOOSE CONNECTED TO DB: ",connectInstance.connection.host);
    } catch (error) {
        console.error("ERROR CONNECTING MONGOOSE: ", error);   
        process.exit(1); 
    }
}
export default connectDB;