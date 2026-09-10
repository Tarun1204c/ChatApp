import userModel from "../models/user.model.js";
import jwt, { decode } from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


export async function register(req,res){

    const{username, email, password} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ {email}, {username}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            mesaage: "user already exists with this email or username",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({username, email, password});

    const emailVerificationToken = jwt.sign({
        email: user.email,

    }, process.env.JWT_SECRET)

    await sendEmail({
        to: email,
        subject: " Welcome to ChatApp!",
        html: 
            `<p>Hi ${username},</p>
            <p>Thankyou for registering at <strong>ChatApp</strong>, we're excited to have you on board!
            <p>Please verify your email address by clicking the link below:</p>
            <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>The ChatApp Team</p>`,
    })

    res.status(201).json({
        message: "User registerd sucessfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
        

    });

}


export async function login(req, res){
    const {email, password } = req.body;

    const user = await userModel.findOne({email})


    if(!user.verified){
        return res.status(400).json({
            message:"Please verify your email before loggin",
            success: false,
            err: "Email not verified"
        })

    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,   
    }, process.env.JWT_SECRET, {expiresIn: '7d'})


    res.cookie("token", token)

    res.status(200).json({
        mesaage: "Logedin successfully",
        success: true,
        user:{
            id: user_id,
            username: user.username,
            email: user.email
        }        

    })

}


export async function verifyEmail(req, res ){
    const {token} = req.query;

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

        const user = await userModel.findOne({ email: decoded.email });

    if(!user){
        return res.status(400).json({
            message: "Invalid token",
            success: false,
            err: "user not found"
        })
    }

    user.verified = true;

    await user.save();

    const html = 
    ` 
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. you can now log in to your account.</p> 
        <a href="http://localhost:3000/login">Go to Login</a>
    `
        return res.send(html);
    }   catch(err) {
         return res.status(400).json({
            message: "Invalid or token expired",
            success: false,
            err: err.mesaage
        })

    }
}    