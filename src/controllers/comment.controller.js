import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if(!videoId?.trim()){
        throw new ApiError(404, "No video found!")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Video ID")
    }

    // comments projection

})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if(!content?.trim()){
        throw new ApiError(404, "Content is required");
    }

    const comment = await Comment.create({
        content: content,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully!"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if(!commentId?.trim()){
        throw new ApiError(404, "Comment ID required!")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(404, "Invalid comment ID")
    }

    if(!content?.trim()){
        throw new ApiError(401, "Content required!")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: content
        }
    }, {new: true}).select("-password")

    if(!comment){
        throw new ApiError(404, "No comment found")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId?.trim()){
        throw new ApiError(404, "Comment ID required")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(404, "Invalid Comment ID")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Comment deleted successfully"))

})

export { getVideoComments, addComment, updateComment, deleteComment }