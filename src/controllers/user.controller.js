import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { use } from "react"

const registerUser=asyncHandler(async (req, res)=>{
    // get user details from frontend
    // data validation - not empty
    // check if user already exist: username, email
    // check image, check avatar
    // upload these to cloudinary, check for avatar
    // create user object - entry in db
    // remove password, refreshToken from response
    // check user creation
    // return res

    const {fullName, email, username, password} = req.body

    if ([fullName, email, username, password].some((field) => field?.trim()==="")) {
        throw new ApiError(400, "all fields are required");
    }

    const existedUser= User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(402, "User already exist")
    }

    const avatarFilePath=req.files?.avatar[0]?.path;
    const coverImageFilePath=req.files?.coverImage[0]?.path;

    if(!avatarFilePath){
        throw new ApiError(400, "avatar is required");
    }

    const avatar=await uploadOnCloudinary(avatarFilePath);
    const coverImage=await uploadOnCloudinary(coverImageFilePath);

    if(!avatar){
        throw new ApiError(400, "avatar is required");
    }

    const user = await User.create({
        fullName,     // fullName: fullName
        email,        // email: email
        password,     // password: password
        username,     // username: username
        avatar: avatar.url,
        coverImage:coverImage?.url||""      // coverImage: coverImage ? coverImage.url : ""
    })

    const createdUser=User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "error in creating user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registerd successfully")
    )
    
})

export {registerUser}