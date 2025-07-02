import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import jwt from "jsonwebtoken"
import { use } from "react"

// access token and refresh token generation code
const generateAccessAndRefreshToken= async (userId) => {
    try {
        const user=await User.findById(userId);
    
        const accessToken= user.generateAccessToken();
        const refreshToken= user.generateRefreshToken();
    
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken};
    } 
    catch (error) {
        throw new ApiError(500, `Error ki MKC : Internal server error :: ${error}`)
    }
}

// userRegister code
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
    // console.log(req.body)

    if ([fullName, email, username, password].some((field) => field?.trim()==="")) {
        throw new ApiError(400, "all fields are required");
    }

    const existedUser= await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(402, "User already exist")
    }

    const avatarFilePath=req.files?.avatar[0]?.path;
    // const coverImageFilePath=req.files?.coverImage[0]?.path;
    // console.log(req.files)

    let coverImageFilePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageFilePath=req.files.coverImage[0].path;
    }

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
        coverImage:coverImage?.url||"",      // coverImage: coverImage ? coverImage.url : ""
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "error in creating user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registerd successfully")
    )
    
})

// userlogin code
const loginUser=asyncHandler(async (req, res) => {
    // data le aao frontend se (req.body)
    // check if the user is already registered or not
    // if not throw error
    // chack password 
    // refrsh and access token
    //cookie

    const {email,username,password}=req.body

    if(!email && !username){
        throw new ApiError(400, "email or username is required")
    }

    const user= await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(400, "user not exists")
    }

    const isPasswordValid =await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(400, "invalid user crediantials")
    }

    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(201, {
            user: loggedInUser,
            refreshToken,
            accessToken
        },"user logged in successfully")
    )


})

// userlogout code
const logoutUser=asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            accessToken: undefined
        },
        {
            new: true
        }
    )
    
    const options={
        httpOnly: true,
        secure: true,
    }

    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(201,{}, "user logged out successfully")
    )
})

// refresh refreshToken
const renewRefreshToken= asyncHandler(async (req, res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    const decodedToken= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)    

    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used") 
    }

    const options={
        httpOnly: true,
        secure: true
    }

    const {newAccessToken, newRefreshToken}= generateAccessAndRefreshToken(user._id)

    res.status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(201,{
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }),
        "Access token refreshed"
    )
})

// change passowrd
const changeCurrentPassword=asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user=await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(201,{},"Password changed successfully")
    )
})

// get access of current user
const getCurrentUser=asyncHandler(async (_, res) => {
    return res.status(201).json(
        new ApiResponse(201, res.user, "User fetched successfully")
    )
})

// update user details - fullName email
const updateAccountDetails=asyncHandler(async (req, res) => {
    const {fullName, email, username}=req.body;
    if(!fullName && !email && !username){
        throw new ApiError(200, "atleast one field is required")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                username
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(201).json(
        new ApiResponse(201, user, "User details updated successfully")
    )
})

// update avatar
const updateAvatar=asyncHandler(async (req, res) => {
    const avatarLocalPath=req.file.path
    if(!avatarLocalPath){
        throw new ApiError(402, "Avatar file is missing")
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(402, "Error while uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },{
            new: true
        }.select("-password")
    )

    return res.status(201).json(
        new ApiResponse(201, user, "User avatar updated successfully")
    )
})

// update coverImage
const updateCoverImage=asyncHandler(async (req, res) => {
    const coverImageLocalPath=req.file.path
    if(!coverImageLocalPath){
        throw new ApiError(402, "coverImage file is missing")
    }
    
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(402, "Error while uploading on coverImage")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },{
            new: true
        }.select("-password")
    )

    return res.status(201).json(
        new ApiResponse(201, user, "User coverImage updated successfully")
    )
})

export {registerUser, loginUser, logoutUser, renewRefreshToken,
    changeCurrentPassword, updateAccountDetails, updateAvatar,
    updateCoverImage, getCurrentUser}
