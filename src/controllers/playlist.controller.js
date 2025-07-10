import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if(!name){
        throw new ApiError(400, "name is required to create a playlist")
    }

    const createdPlaylist =await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    
    if(!createdPlaylist){
        throw new ApiError(500, "error in creating playlist")
    }

    return res.status(200).json(
        new ApiResponse(201, createdPlaylist, "playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    // using find() + populate()
    const playlists = await Playlist.find({ owner: userId})
                            .populate("owner","fullName email avatar")  // Select only needed fields
    // console.log(playlists)

    return res.status(200).json(
        new ApiResponse(201, playlists, "user playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "there is no such playlist || error in finding playlist")
    }

    return res.status(200).json(
        new ApiResponse(201, playlist, "playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: add video from playlist

    // const playlist=await Playlist.findById(playlistId)
    // if(!playlist){
    //     throw new ApiError(402, "playlist doesn't exist")
    // }

    // const isVideoAlreadyInPlaylist =playlist.videos.includes(videoId)
    // if(isVideoAlreadyInPlaylist){
    //     throw new ApiError(402, "Video Already In Playlist")
    // }
    // // console.log(isVideoAlreadyInPlaylist)

    // playlist.videos.push(videoId)
    // await playlist.save()

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(201, playlist, "video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    // const playlist=await Playlist.findById(playlistId)
    // if(!playlist){
    //     throw new ApiError(402, "playlist doesn't exist")
    // }

    // const isVideoInPlaylist =playlist.videos.includes(videoId)
    // if(!isVideoInPlaylist){
    //     throw new ApiError(402, "Video not In Playlist")
    // }
    // // console.log(isVideoInPlaylist)

    // playlist.videos=playlist.videos.filter((el)=>(el!=videoId))
    // await playlist.save()

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(201, playlist, "video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(401, "error in deleting playlist")
    }

    return res.status(200).json(
        new ApiResponse(201, deletedPlaylist, "playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {newName, newDescription} = req.body
    //TODO: update playlist

    if(!newName && !newDescription){
        throw new ApiError(400, "atleast one field is required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name: newName,
                description: newDescription
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(201, updatedPlaylist, "playlist details updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}