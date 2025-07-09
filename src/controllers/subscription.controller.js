import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    const existedSubscription=await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(existedSubscription){
        // Unsubscribe
        await Subscription.deleteOne({_id: existedSubscription._id})
        return res.status(200).json(
            new ApiResponse(201, existedSubscription,"unsubscribed successfully")
        )
    }else{
        // Subscribe
        const createdSubscription=await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        if(!createdSubscription){
            throw new ApiError(400, "error in creating Subscription document")
        }

        return res.status(200).json(
            new ApiResponse(201, createdSubscription,"subscribed successfully")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // const subs = await Subscription.find({channel: channelId})
    // console.log(subs)
    const result=await Subscription.aggregate([
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
                as: "subscriptionDets"
            }
        },
        {
            $unwind: '$subscriptionDets'
        },
        {
            $project: {
                _id: 0,
                subscriberId: '$subscriptionDets._id',
                fullName: '$subscriptionDets.fullName',
                // email: '$subscriptionDets.email',
                // avatar: '$subscriptionDets.avatar'
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(200, result, "success")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const result=await Subscription.aggregate([
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
                as: "subscribedChannelsDets"
            }
        },
        {
            $unwind: "$subscribedChannelsDets"
        },
        {
            $project: {
                _id: 0,
                channelId: "$subscribedChannelsDets._id",
                channelName: "$subscribedChannelsDets.fullName",
                // channelAvatar: "$subscribedChannelsDets.avatar",
            }
        }
    ])
    return res.status(201).json(
        new ApiResponse(201, result, "successfully fecthed subscribed channels")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}