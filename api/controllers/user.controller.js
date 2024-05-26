import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";


export const getUserProfile=async (req, res, next) =>{
    const {username}=req.params

    try {
        const user= await User.findOne({username}).select("-password");
        if(!user){
            return next(errorHandler(404 ,"user not found"));
        }

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }

}

export const getSuggestedUsers=async (req, res, next) =>{
    try {
        const userId=req.user.id;

        const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);

        
    } catch (error) {
        next(error);
    }

}

export const followUnfollowUser=async (req, res, next) =>{
    try {
        const {id}=req.params;
        const userToModify=await User.findById(id);
        const currentUser=await User.findById(req.user.id);

        if(id === req.user.id){
            return next(errorHandler(400, "you can't follow yourself"));
        }

        if(!userToModify || !currentUser){
            return next(errorHandler(404, "user not found"));
        }
        const isFollowing=currentUser.following.includes(id);
        if(isFollowing){
            // Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            res.status(200).json({ message: "User unfollowed successfully" });  

        }else{
            // follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            // Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user.id,
				to: userToModify._id,
			});
			await newNotification.save();

            res.status(200).json({ message: "User followed successfully" });
        } 
    } catch (error) {
        next(error);
    }
}


export const updateUser = async (req, res, next) => {
  try {
      // Validate password
      if (req.body.password) {
          if (req.body.password.length < 6) {
              return next(errorHandler(400, 'Password must be at least 6 characters'));
          }
          req.body.password = bcryptjs.hashSync(req.body.password, 10);
      }
      
      // Validate username
      if (req.body.username) {
          if (req.body.username.length < 7 || req.body.username.length > 20) {
              return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
          }
          if (req.body.username.includes(' ')) {
              return next(errorHandler(400, 'Username cannot contain spaces'));
          }
          if (req.body.username !== req.body.username.toLowerCase()) {
              return next(errorHandler(400, 'Username must be lowercase'));
          }
          if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
              return next(errorHandler(400, 'Username can only contain letters and numbers'));
          }
      }

      const updatedUser = await User.findByIdAndUpdate(
          req.user.id,
          {
              $set: {
                  fullName: req.body.fullName,
                  email: req.body.email,
                  username: req.body.username,
                  password: req.body.password,
                  bio: req.body.bio,
                  link: req.body.link,
                  profileImg: req.body.profileImg,
                  coverImg: req.body.coverImg,
              },
          },
          { new: true }
      );
      
      const { password, ...rest } = updatedUser._doc;
      res.status(200).json(rest);
  } catch (error) {
      console.error("Error updating user:", error);
      next(error);
  }
};

