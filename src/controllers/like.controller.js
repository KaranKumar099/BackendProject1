import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const existedLike=await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if(existedLike){
        await Like.deleteOne({
            video: videoId,
            likedBy: req.user._id
        })
    }else{
        await Like.create({
            video: videoId,
            likedBy: req.user._id 
        })
    }

    return res.status(200).json(
        new ApiResponse(201, {}, existedLike? "video disliked successfully" : "video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const existedLike=await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existedLike){
        await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        })
    }else{
        await Like.create({
            comment: commentId,
            likedBy: req.user._id 
        })
    }

    return res.status(200).json(
        new ApiResponse(201, {}, existedLike? "comment disliked successfully" : "comment liked successfully")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const allLikedVideos=await Like.find({
        likedBy: req.user._id,
        video: {
            $exists: true
        }
    })

    return res.status(200).json(
        new ApiResponse(201, allLikedVideos, "all liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}