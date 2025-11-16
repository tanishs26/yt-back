import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

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
  console.log(req.body);

  if (
    [email, fullName, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // now we will extrat the local path of the files which is uploaded to public/temp using multer
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file path is required");
  }

  let coverImageLocalPath;
  if (
    req.files?.coverImage &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  console.log(req.files);

  // Uploading on cloudinary after taking the path from multer upload which has been done in routes of register as middleware
  const avatarUrl = await cloudinaryUpload(avatarLocalPath);
  const coverImageUrl = await cloudinaryUpload(coverImageLocalPath);
  if (!avatarUrl) {
    throw new ApiError(400, "Avatar file url is required");
  }

  // Now creating the user when we get all the fields---
  const user = await User.create({
    fullName,
    email,
    userName: userName.toLowerCase(),
    avatar: avatarUrl.url,
    coverImage: coverImageUrl?.url || "",
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully."));
});

// LOGIN HANDLER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;
  // check that email or password is not empty
  if (!email && !userName) {
    throw new ApiError(400, "Email or Username required");
  }

  // finding if the user exists in the mongodb
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  //now if user exists then checking the password entered is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid password!");
  }

  // accessing access and refresh token from the method we made
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //getting the user with new refresh token becuse at first we didn't hvae acccess token there
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // sending cookies

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User logged in successfully!"
      )
    );
});

// LOGOUT HANDLER
const logoutUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  const userId = req.user._id;
  await User.findByIdAndUpdate(
    userId,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// REFRESH ACCESSS TOKEN HANDLER
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    req.user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        "Access token refreshed successfully!"
      )
    );
});

// CHANGE PASSWORD HANDLER
const changeCurrentPassword = asyncHandler(async (req, res) => {
  console.log("This is the request : ", req);
  const { oldPassword, newPassword } = req.body;

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPassCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPassCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
});

// GET CURRENT USER INFORMATION
const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

// UPDATE ACCOUNT DETAIL

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;
  if (!email || !fullName) throw new ApiError(400, "All fields are required");

  const newDetail = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, newDetail, "User details updated successfully"));
});

export {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
};
