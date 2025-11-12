import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(()=>{
    app.get('/',(req,res)=>{
        res.send("API IS RUNNING Bro...");
    })
    app.listen(process.env.port || 8000,()=>{
        console.log(`SERVER STARTED AT PORT ${process.env.port || 8000}`);
    })
  })
  .catch((err) => console.log("ERROR CONNECTING DB main Index:", err));

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
