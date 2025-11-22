import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId.trim()){
        throw new ApiError(404, "Video ID required!")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    const userId = req.user._id

    if(!userId){
        throw new ApiError(400, "User ID required!")
    }

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id)
        return res
        .status(201)
        .json(new ApiResponse(201, null, "Unliked video successfully"))
    }

    const like = await Like.create({
        video: videoId,
        likedBy: userId
    })

    if(!like){
        throw new ApiError(401, "could not like the video")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, like, "Liked video successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    if (!commentId){
        throw new ApiError(401, "Comment ID required!")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "Invalid comment ID")
    }

    const userId = req.user._id

    if(!userId){
        throw new ApiError(401, "User ID required!")
    }

    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id)
        return res
        .status(201)
        .json(new ApiResponse(201, null, "Unliked comment successfully"))
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    if(!like){
        throw new ApiError(401, "could not like the comment")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, like, "Liked comment successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    if (!tweetId){
        throw new ApiError(401, "Tweet ID required!")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "Invalid tweet ID")
    }

    const userId = req.user._id

    if(!userId){
        throw new ApiError(401, "User ID required!")
    }

    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id)
        return res
        .status(201)
        .json(new ApiResponse(201, null, "Unliked tweet successfully"))
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    if(!like){
        throw new ApiError(401, "could not like the tweet")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, like, "Liked tweet successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.user._id

    if(!userId){
        throw new ApiError(401, "User ID required!")
    }

    const likedVideos = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likedByUser",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "video",
                            foreignField: "_id",
                            as: "videoLikedByUser",
                            pipeline: [
                                // {
                                //     $project: {
                                //         username: 1,
                                //         avatar: 1,
                                //         title: 1,
                                //         thumbnail: 1,
                                //         videoFile: 1
                                //     }
                                // }
                            ]
                        }
                    }
                ]
            }
        },{}
    ])
})

export { toggleVideoLike, toggleCommentLike, toggleTweetLike,getLikedVideos }