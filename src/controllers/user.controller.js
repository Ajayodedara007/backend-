import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from '../utils/ApiEroor.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const genrateaccessandrefreshtocken = async(userid)=>{
    try {   
        const user = await User.findById(userid)

        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()


        User.RefreshToken =RefreshToken
        await User.save({validateBeforeSave: false})

        return {AccessToken,RefreshToken}

    } catch (error) {
        throw new ApiError(500,"somethingwent wrong while creating acccess tocken and refresh tocken")
    }
}


const registerUser = asyncHandler( async (req,res)=>{
    const {fullName ,email,username,password} = req.body
    console.log("Email",email)

    // some fun
    // It returns true if the callback function returns a truthy value for at least one element, 
    if (
        [fullName,email,username ,password].some((fields)=> 
            fields?.trim === "")
    ){
        throw new ApiError(400,"All Fields are require")
    }

   const existeduser = User.findOne({   
        $or:({username},{email})
    })

    if (existeduser){
        throw new ApiError(409,"user with username or email already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )



})


const loginuser = asyncHandler(async (req,res)=>{

    const {username,email,password} = req.body

    if(!username || !email){
        throw new ApiError(401,"enter username or password")
    }

    const user = await User.findOne({
        $or :({username},{email})
    })

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const ispassworvalid = await user.isPasswordCorrect(password)

    if(!ispassworvalid){
        throw new ApiError(400,"password is incorrect")
    }

   const  { AccessToken , RefreshToken } = await genrateaccessandrefreshtocken(user._id)

    const loggedinuser = await User.findById(user._id)
    .select("-password -refreshToken")


    const options ={
        httponly:true,  // not modified by user
        secure:true
    }


    res.status(200).
    cookie()


})


export {registerUser ,loginuser}