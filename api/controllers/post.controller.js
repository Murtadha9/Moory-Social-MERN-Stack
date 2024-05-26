import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"



export const createPost=async (req, res, next) =>{
    try {

        const userId=req.user.id;
        const user = await User.findById(userId);
        if(!user) {
            return next(errorHandler(404 ,"user not found"));
        }

        const newPost = new Post({
            ...req.body,
            user: userId,
          });

        await newPost.save();
		res.status(201).json(newPost);  
    } catch (error) {
        next(error);
    }
}



export const likeUnlikePost = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id: postId } = req.params;

        console.log(`User ID: ${userId}, Post ID: ${postId}`);

        const post = await Post.findById(postId);
        if (!post) {
            console.error('Post not found');
            return next(errorHandler(404, "Post not found"));
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            console.log('Unliking post');
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        } else {
            console.log('Liking post');
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();

            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }
    } catch (error) {
        console.error(`Error in likeUnlikePost: ${error.message}`);
        next(error);
    }
};




export const commentOnPost=async (req, res, next) =>{
    try {
        const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user.id;

        if(!text){
            return next(errorHandler(400, "Text field is required" ));
        }

        const post = await Post.findById(postId);

		if (!post) {
			return next(errorHandler(404,"Post not found"));
		}

        const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
        
    } catch (error) {
       next(error); 
    }
}



export const deletePost=async (req, res, next) =>{

   
    try {
        const post = await Post.findById(req.params.id);
		if (!post) {
			return next(errorHandler(404,"Post not found"));
		}

		if (post.user.toString() !== req.user.id.toString()) {
			return next(errorHandler(401,"You are not authorized to delete this post"));
		}

		

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
        
      } catch (error) {
        next(error);
      }
}


export const getAllPosts=async (req, res, next) =>{

    try {
        const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

    if (posts.length === 0) {
        return res.status(200).json([]);
    }

    res.status(200).json(posts);

    } catch (error) {
        next(error);
    }

}


export const getLikedPosts=async (req, res, next) =>{
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            return next(errorHandler(404, "User not found"));
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

    res.status(200).json(likedPosts);

        
    } catch (error) {
        next(error);
    }
}



export const getFollowingPosts=async (req, res, next) =>{
    try {
        const userId = req.user.id;
		const user = await User.findById(userId);
		if (!user){
            return next(errorHandler(404, "User not found"));
        }

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
    } catch (error) {
        next(error);
    }
}





export const getUserPosts=async (req, res, next) =>{
    try {
        const username  = req.params.username;

		const user = await User.findOne({ username });
		if (!user) {
            return next(errorHandler(404, "User not found"));
        }

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
        
    } catch (error) {
        next(error);
        
    }
}





