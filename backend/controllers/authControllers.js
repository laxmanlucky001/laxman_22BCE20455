const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const Poll = require("../models/Poll")

//Generate JWT token

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:'1h'})
}

//Register User 

exports.registerUser = async(req,res) =>{
    const {fullName,username,email,password,profileImageUrl} = req.body || {};

    //validate missing fields
    if(!fullName || !username || !email || !password) {
        return res.status(400).json({message:'All fields are required'});
    }

    //validate username
    //allows alphanumeric only
    const usernameRegex = /^[a-zA-Z0-9-]+$/;
    if(!usernameRegex.test(username)){
        return res.status(400).json({
            message:
            "Invalid username. Only alphanumeric and hyphens are allowed.No spaces are permitted",
        })
    }

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"Email not available.Try another one."})
        }

        const user = await User.create({
            fullName,
            username,
            email,
            password,
            profileImageUrl,
        })

        res.status(201).json({
            id:user._id,
            user,
            token:generateToken(user._id),
        })
    }catch(error){
        res.status(500).json({message:"Error registering user",error:error.message});
    }

}

//Login User 
exports.loginUser = async (req, res)=>{
    const {email,password} = req.body

    //validate missing fields
    if(!email || !password) {
        return res.status(400).json({message:'All fields are required'});
    }

    try{
        const user = await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        //count polls created by user
        const totalPollsCreated = await Poll.countDocuments({creator:user._id})

        //count polls the user hase voted in 
        const totalPollsVoted =await Poll.countDocuments({voters:user._id})

        //count of bookmarked polls
        const totalPollsBookmarked = user.bookmarkedPolls.length
        res.status(201).json({
            id:user._id,
            user:{
                ...user.toObject(),
                totalPollsCreated,
                totalPollsVoted,
                totalPollsBookmarked,
            },
            token:generateToken(user._id)
        });
    }catch(error){
        res.status(500).json({message:"Error during login",error:error.message})
    }
}

//get User Info
exports.getUserInfo = async (req ,res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        //count polls created by user
        const totalPollsCreated = await Poll.countDocuments({creator:user._id})

        //count polls the user hase voted in 
        const totalPollsVoted =await Poll.countDocuments({voters:user._id})

        //count of bookmarked polls
        const totalPollsBookmarked = user.bookmarkedPolls.length


        const userInfo = {
            ...user.toObject(),
            totalPollsCreated,
            totalPollsVoted,
            totalPollsBookmarked
        };
        res.status(200).json(userInfo)
    }catch(err){
        return res.status(500).json({message:"Error in Fetching",error:err.message})
    }
}