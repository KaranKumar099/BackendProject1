import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { use } from "react"

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
    .clearCookie(accessToken,options)
    .clearCookie(refreshToken,options)
    .json(
        new ApiResponse(201,{}, "user logged out successfully")
    )
})

export {registerUser, loginUser, logoutUser}
