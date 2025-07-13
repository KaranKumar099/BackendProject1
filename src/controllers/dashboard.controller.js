import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId}= req.params

    const subs=await Subscription.countDocuments({channel: channelId})
    let subsCount=0;
    if(!subs){
        subsCount=subs
    }

    const videos=await Video.countDocuments({owner: channelId})
    let vdoCount=0;
    if(videos){
        vdoCount=videos
    }

    const allVideos=await Video.find({owner: channelId})
    let likesCount=0
    for (const vdo of allVideos) {
        likesCount += await Like.countDocuments({video: vdo._id})
    }

    return res.status(200).json(
        new ApiResponse(201, {
            subsCount,
            vdoCount,
            likesCount
        }, "total number of subscribers fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { page = 1, limit = 10, query, sortBy, sortType, channelId } = req.query

    const filter={}
    if(query){
        filter.title={
            $regex: query,
            $options: 'i'
        }
    }
    if(channelId){
        filter.owner=channelId
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

export {
    getChannelStats, 
    getChannelVideos
}