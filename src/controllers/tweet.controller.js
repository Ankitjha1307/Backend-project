import mongoose, {isValidObjectId} from "mongoose";
import { Tweet } from "../models/tweet.model";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if(!content?.trim()){
        throw new ApiError(404, "Content Required!")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, Tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
   const { userId } = req.params

   if(!userId){
    throw new ApiError(401, "UserID required")
   }

   const tweets = await User.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(userId)
        }   
    }, 
    {
        $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "owner",
            as: "tweets"
        }
    },
    {
        $project: {
            fullname: 1,
            username: 1,
            tweets: 1
        }
    }
   ]);

   return res
        .status(200)
        .json(
            new ApiResponse(200, tweets, "User tweets fetched successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if(!tweetId?.trim()){
        throw new ApiError(404, "Tweet ID is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "Tweet ID is not valid")
    }

    if(!content?.trim()){
        throw new ApiError(404, "Content Required!")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content: content
        }
    }, {new: true}).select("-password");

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!tweetId?.trim()){
        throw new ApiError(404, "Tweet ID is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "Tweet ID is not valid")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet deleted successfully"))
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }