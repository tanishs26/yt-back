import { upload } from "../middlewares/multer.middleware.js";
// import { User } from "../models/user.model";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const aggregate = await Video.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              userName: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
      },
    },

  ]);

  const options={
    page:parseInt(page),
    limit:parseInt(limit),

  }
const allVideos=await Video.aggregatePaginate(aggregate,options)
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "Videos fetched successfully"));
});

const uploadAVideo=asyncHandler(async(req,res)=>{
    const{title,description}=req.body;
    if(!(title.trim() && description.trim())) throw new ApiError(409,"Title and description required")


    const videoFilePath= req.files.videoFile[0].path;
    const thumbnailPath= req.files.thumbnail[0].path;

    
    if(!videoFilePath || !thumbnailPath) throw new ApiError(409,"Video file and thumbnail required")

    const videoFileUrl=await cloudinaryUpload(videoFilePath)
    const thumbnailUrl = await cloudinaryUpload(thumbnailPath);

    
    if(!videoFileUrl || !thumbnailUrl) throw new ApiError(409,"cloudinary upload not successful")

   
    const video= await Video.create({
        videoFile:videoFileUrl.url,
        thumbnail:thumbnailUrl.url,
        duration:videoFileUrl.duration,
        title,
        description,
        owner:req.user._id
    })

    if(!video){
        throw new ApiError(404,"Video Not Uploaded")
    }

    return res.status(200).json(new ApiResponse(200,video,"Video Uploaded successfully!"))
})

export {
    getAllVideos,
    uploadAVideo
}