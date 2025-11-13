import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // take entries from frontend
  // check if the user exists
  // check coverimage or avatar
  // upload avatar to cloudinary through the help of multer
  // create a user object with the help of entries
  // remove the password and refresh token from the resposne 
  // check for user creation 
  // return response 

  const { email, fullName, userName, password } = req.body;
  console.log(req.body)


  if ([email, fullName, userName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required")
  }

  const existingUser = await User.findOne(
    {
      $or: [{userName}, {email}]
    }
  )
  if (existingUser) {
    throw new ApiError(409, "User already exists")
  }

  // now we will extrat the local path of the files which is uploaded to public/temp using multer 
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file path is required")
  }

  let coverImageLocalPath;
  if(req.files?.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path
  }

  console.log(req.files)

  // Uploading on cloudinary after taking the path from multer upload which has been done in routes of register as middleware
  const avatarUrl = await cloudinaryUpload(avatarLocalPath);
  const coverImageUrl = await cloudinaryUpload(coverImageLocalPath);
  if (!avatarUrl) {
    throw new ApiError(400, "Avatar file url is required")
  }
  
  // Now creating the user when we get all the fields---
  const user=await User.create({
    fullName,
    email,
    userName:userName.toLowerCase(),
    avatar:avatarUrl.url,
    coverImage:coverImageUrl?.url ||"",
    password
  })
  const createdUser=await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while creating User")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User created successfully.")
  )



});

export { registerUser };