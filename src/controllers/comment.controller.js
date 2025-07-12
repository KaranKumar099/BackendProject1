import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    const allCommments= await Comment.find({video: videoId})
                                .skip((page-1)*limit)
                                .limit(parseInt(limit))
    
    return res.status(200).json(
        new ApiResponse(200, allCommments, "all comments of video fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(401, "content is required")
    }

    const addedComment=await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, addedComment, "comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newContent} = req.body

    const updatedComment= await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newContent
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const deletedComment= await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(200, deletedComment, "comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}