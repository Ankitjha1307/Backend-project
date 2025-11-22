import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if(!channelId.trim()){
        throw new ApiError(401, "Channel ID required!")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(401, "Invalid channel ID")
    }

    const userId = req.user._id

    if(!userId){
        throw new ApiError(401, "User ID required!")
    }

    const alreadySubscribed = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if(alreadySubscribed){
        await Subscription.findByIdAndDelete(alreadySubscribed._id)
        return res
        .status(201)
        .json(new ApiResponse(201, null, "Unsubscribed successfully"))
    }

    const subscribe = await Subscription.create({
        subscriber: userId,
        channel: channelId
    })

    return res
    .status(201)
    .json(new ApiResponse(201, subscribe, "Subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId.trim()){
        throw new ApiError(401, "Channel ID required!")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo"
            }
        },
        {
            $unwind: "subscriberInfo"
        },
        {
            $project: {
                _id: "$subscriberInfo._id",
                fullname: "$subscriberInfo.fullname",
                username: "$subscriberInfo.username",
                avatar: "$subsciberInfo.avatar"
            }
        }
    ]);

    if(!subscribers){
        throw new ApiError(404, "No subscribers found!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId.trim()){
        throw new ApiError(401, "Subscriber ID required!")
    }

    const channelsSubscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo"
            }
        },
        {
            $unwind: "$channelInfo"
        },
        {
            $project: {
                _id: "$channelInfo._id",
                fullname: "$channelInfo.fullname",
                username: "$channelInfo.username",
                avatar: "$channelInfo.avatar"
            }
        }
    ]);

    if(!channelsSubscribedTo){
        throw new ApiError(404, "No subscribed channels found!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channelsSubscribedTo, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}