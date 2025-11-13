import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});

const cloudinaryUpload = async (localFilePath) => {
  try {
    if (!localFilePath) return;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("CLOUDINARY UPLOAD SUCCESSFUL: ", response);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    console.error("CLOUDINARY UPLOAD ERROR: ", error);  
    fs.unlinkSync(localFilePath)//remove the file from local uploads folder if upload to cloudinary fails
  }
};

export {cloudinaryUpload};