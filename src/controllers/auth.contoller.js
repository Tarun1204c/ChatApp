import userModel from "../models/user.model";
import jwt from "jsonwebtoken";


export async function register(req,res){

    const{username, email, password} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $Or: [ {emil}, {username}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            mesaage: "user already exists with this email or username",
            sucess: false,
            err: "User already exists"
        })
    }

}
