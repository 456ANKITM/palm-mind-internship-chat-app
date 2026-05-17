import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import generateToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email ||!password) {
            return res.status(400).json({
                success:false, 
                message:"Name, email and password are required"
            })
        }

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false, 
                message:"User already exists"
            })
        }

        
       let profileImage = ""
        // Now we need to upload the profile image to cloudinary if profile image is given
         if (req.files?.profileImage) {
      const file = req.files.profileImage[0];

      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          message: "Only image files are allowed",
        });
      }

      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profiles" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await uploadFromBuffer(file.buffer);
      profileImage = result.secure_url;
    } 

    const user = await User.create({name, email, password, profileImage})

    return res.status(201).json({success:true, message:"User registered successfully"})

    } catch (error) {
        return res.status(500).json({
            success:false, 
            message:"Server Error",
            error:error.message
        })
    }
}

export const login = async (req, res) => {
  try {
  
    const { email, password } = req.body;

    // validations
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }


    const token = generateToken(user._id);

    const userData = user.toObject();
    delete userData.password;

  res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success:true,
      user: req.user
    })
  } catch (error) {
    return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly:true,
      sameSite:"strict"
    })

     return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
    
  } catch (error) {
     return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query, "i");

    const users = await User.find({
      name: { $regex: searchRegex },
    }).select("name email profileImage");

    // ✅ Rank results (best match first)
    const sortedUsers = users.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const q = query.toLowerCase();

      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aExact = aName === q;
      const bExact = bName === q;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return 0;
    });

    return res.status(200).json({
      success: true,
      users: sortedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};