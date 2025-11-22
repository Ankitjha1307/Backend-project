import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model"
import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { uploadOnCloudinary } from "../utils/Cloudinary"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!title?.trim()){
        throw new ApiError(400, "Title is required!")
    }

    if(!description?.trim()){
        throw new ApiError(400, "Description is required!")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    
    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    }

    if(!videoLocalPath){
        throw new ApiError(400, "Video path not found!")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!(videoFile || thumbnail)) {
        throw new ApiError("Error while uploading file on cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        isPublished: true,
        owner: req._id
    })
    await video.save();

     return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video published successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId?.trim()){
        throw new ApiError(404, "Video ID required")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Video ID")
    }

     const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if(!videoId?.trim()){
        throw new ApiError(404, "Video ID required")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Video ID")
    }

    if([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required")
    }
    
    const thumbnailPath= req.file?.path
    if(!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailPath)
    if(!thumbnailUploadResult) {
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title: title,
            description: description,
            thumbnail: thumbnailUploadResult.url
        }
    }, {new: true}).select("-password")

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, video, "Video updated successfully"))
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo }