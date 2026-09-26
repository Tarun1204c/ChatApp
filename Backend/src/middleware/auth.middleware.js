import jwt from "jsonwebtoken";



export function authUser(req,res,next){

    console.log("COOKIE:", req.cookies);
    
    const token = req.cookies.token;

    if(!token){
        return res.status(400).json({
            message: "Unauthorized",
            success: false,
            err: "No token provided"
        })
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();

    }catch(err){
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            err: "Invalid token"
        })
    }
}