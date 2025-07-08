import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import cloudinary from "cloudinary"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const filter={}
    if(query){    
        filter.title={
            $regex:query,
            $options: 'i'
        }
    }
    if(userId){
        filter.user=userId
    }

    const sort={}
    sort[sortBy]=sortType==="asc" ? 1 : -1

    const videos=await Video.find(filter)
    .sort(sort)
    .skip((page-1)*limit)
    .limit(parseInt(limit))

    const total=await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(201,{
            total,
            page: Number(page),
            totalPages: Math.ceil(total/limit),
            data: videos
        },"all videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400, "title and description are required")
    }

    // console.log(req.body)
    // console.log(req.files.videoFile)
    // console.log(req.files.thumbnail[0])

    const videoFileLocalPath=req.files?.videoFile[0]?.path
    if(!videoFileLocalPath){
        throw new ApiError(400, "videoFile is required")
    }

    const thumbnailLocalPath=req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required")
    }

    const videoFile= await uploadOnCloudinary(videoFileLocalPath)
    if(!videoFile){
        throw new ApiError(400, "error while uploading videoFile on cloudinary")
    }

    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400, "error while uploading thumbnail on cloudinary")
    }

    const video=await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        isPublished: true,
        views: 0,
        owner: req.user._id
    })

    // console.log(video)

    const publishedVideo = await Video.findById(video._id)
    if(!publishedVideo){
        throw new ApiError(500, "error in creating video")
    }

    res.status(200).json(
        new ApiResponse(201, publishedVideo, "video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found")
    }

    return res.status(200).json(
        new ApiResponse(201, video, "video found successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {newTitle, newDescription} = req.body
    const newThumbnailLocalFilePath= req.file?.path
    if(!newTitle && !newDescription && !newThumbnailLocalFilePath){
        throw new ApiError(200, "at least one field in required")
    }
    // console.log(req.file)

    // to delete file from cloudinary
    const thumbnail=await uploadOnCloudinary(newThumbnailLocalFilePath)


    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: newTitle,
                description: newDescription,
                thumbnail: thumbnail?.url
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(201, {video}, "video details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(200, "video not found")
    }
    console.log(deletedVideo)
    await cloudinary.uploader.destroy(deletedVideo._id)

    return res.status(200).json(
        new ApiResponse(201, deletedVideo, "video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findById(videoId)
    const updatedVideo=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished: !video.isPublished
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(201, updatedVideo, "successfully toggled publish status")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}