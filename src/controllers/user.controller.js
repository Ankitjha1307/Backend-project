import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokensAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken= refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken, refreshToken   }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
    }
}

const registerUser= asyncHandler (async (req,res) => {
    // get user details from frontend
    // validation- not empty
    // check if user already exists: username, email
    // check for images and avatar
    // upload them to cloudinary
    // create user object- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullname, username, email, password}= req.body;
    // console.log("req.body: "+req.body);
    // console.log("email: ", email);

    // if (fullname === "") {
    //     throw new ApiError(400, "fullname is required")
    // }                      used by beginners and is completely fine but can be optimised in advanced form as below
    
    if ([fullname, email, username, password].some((field) => field?.trim ==="")) {
        throw new ApiError(400, "All fields are required!!")
    } // checks for all fields if they are null

    const existingUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if (existingUser) {
        throw new ApiError(409, "user with this username or email already exists!!")
    }

    console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath= req.files.coverImage[0].path
    } // very important code piece block

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!!")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user= await User.create({
        fullname, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser= asyncHandler (async (req,res) => {
    const {username, email, password} = req.body

    if (!(username || email)){
        throw new ApiError(400, "username or email required")
    }

    const user= await User.findOne({ $or: [{username}, {email}]})
    
    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessTokensAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true, 
        secure: true
    }

    return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, {
                user: loggedInUser, accessToken, refreshToken
            } // sending access and refresh tokens  to allow user to save them other than from cookies in local storage for any use or for development purposes- not a good practice but fine for now
        ), 
        "User logged in successfully"
    )
})

const logoutUser= asyncHandler (async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
     const options = {
        httpOnly: true,
        secure: true
     } 

     return res 
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export {registerUser, loginUser, logoutUser}