import mongoose from "mongoose"
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

    const subs = await Subscription.find({channel: channelId})
                        .populate("subscriber" ,"fullName email avatar")
                        .select("-createdAt -updatedAt -channel")
    // console.log(subs)

    return res.status(200).json(
        new ApiResponse(200, subs, "success")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subbedchannel=await Subscription.find({subscriber: subscriberId})
                                .populate("channel", "fullName email avatar")
                                .select("-createdAt -updatedAt -subscriber")

    return res.status(201).json(
        new ApiResponse(201, subbedchannel, "successfully fecthed subscribed channels")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}