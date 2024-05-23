import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

import jwt from 'jsonwebtoken';


export const signup=async(req,res,next)=>{

    try {
        const {fullName , username ,email, password}=req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
			return next(errorHandler(400, "Invalid email format" ))
		}

        const existingUser =await User.findOne({username});
        if(existingUser ){
            return next(errorHandler(400, "User already exists" ))
        }

        const existingEmail =await User.findOne({email});
        if(existingEmail ){
            return next(errorHandler(400, "Email already exists" ))
        }
        

        const hashedPassword = bcryptjs.hashSync(password,10)

        const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

         await newUser.save();
        res.status(201).json({
                _id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
        })
 
    } catch (error) {
        next(error);
    }

}


export const signin=async(req,res,next)=>{
    try {
        const {  username , password}=req.body;
        const validUser= await User.findOne({username})
        if(!validUser){
            return next(errorHandler(400, "Invalid username " ))
        }
        const validPassword=bcryptjs.compareSync(password,validUser.password)
        if(!validPassword){
            return next(errorHandler(400,'invalid  password'));
        }

        const token =jwt.sign(
            {id:validUser._id },
            process.env.JWT_SECRET,
        )
        const {password:pass ,...others}=validUser._doc
        res.status(200).cookie('access_token',token ,{httpOnly:true}).json(others)


        
    } catch (error) {
        next(error);
    }
    
}



export const signout=async(req,res,next)=>{
    try {
        res
          .clearCookie('access_token')
          .status(200)
          .json('User has been signed out');
      } catch (error) {
        next(error);
      }
}

export const google=async(req,res,next)=>{
    
}



export const getMe = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return next(errorHandler(404, 'User not found'));
		}
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};




