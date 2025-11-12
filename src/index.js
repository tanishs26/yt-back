import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path:"./env"
})

const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/yt-backend`);
//     app.on("error", (err) => {
//       console.error("ERROR CONNECTING MONGOOSE: ", err);
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`SERVER STARTED AT PORT ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR: ", error);
//     throw error;
//   }
// })();
connectDB()
