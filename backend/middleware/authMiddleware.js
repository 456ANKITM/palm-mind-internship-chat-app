import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if(!token)  {
            return res.status(401).json({
                success:false, 
                message:"Unauthorized"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            return res.status(401).json({
                message:"Not Authenticated"
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success:false, 
            message:"Server Error",
            error:error.message
        })
    }
}