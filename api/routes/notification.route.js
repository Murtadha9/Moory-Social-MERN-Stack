import express from "express";
import { verifyToken } from '../utils/verifyUser.js';
import { deleteNotifications, getNotifications ,deleteNotification } from "../controllers/notification.controller.js";


const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.delete("/", verifyToken, deleteNotifications);
router.delete("/:id", verifyToken, deleteNotification);

export default router;