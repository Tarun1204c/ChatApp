import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


export async function register(req,res){

    const{username, email, password} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ {email}, {username}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            mesaage: "user already exists with this email or username",
            sucess: false,
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
            <a href="http://localhost:3000/api/auth-verify-email?token=${emailVerificationToken}">Verify Email</a>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>The ChatApp Team</p>`,
    })

    res.status(201).json({
        message: "User registerd sucessfully",
        sucess: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
        

    })



}
