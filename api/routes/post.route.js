import express from "express";
import { verifyToken } from '../utils/verifyUser.js';
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from "../controllers/post.controller.js";

const router = express.Router();


router.post("/create", verifyToken, createPost);
router.post("/like/:id", verifyToken, likeUnlikePost);
router.post("/comment/:id", verifyToken, commentOnPost);
router.delete("/:id", verifyToken, deletePost);


router.get("/all", verifyToken, getAllPosts);
router.get("/likes/:id", verifyToken, getLikedPosts);
router.get("/following", verifyToken, getFollowingPosts);
router.get("/user/:username", verifyToken, getUserPosts);



export default router;