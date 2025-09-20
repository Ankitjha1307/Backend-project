import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

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

    const {fullname, username, email, password}= req.body
    console.log("email: ", email);

    // if (fullname === "") {
    //     throw new ApiError(400, "fullname is required")
    // }                      used by beginners and is completely fine but can be optimised in advanced form as below
    
    if ([fullname, email, username, password].some((field) => field?.trim ==="")) {
        throw new ApiError(400, "All fields are required!!")
    } // checks for all fields if they are null

    const existingUser = User.findOne({
        $or : [{username}, {email}]
    })

    if (existingUser) {
        throw new ApiError(409, "user with this username or email already exists!!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
})

export {registerUser}