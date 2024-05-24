import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";



export const getNotifications=async(req,res,next)=>{
    try {
        const userId = req.user.id;
        
		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
        
    } catch (error) {
        next(error);
    }

}

export const deleteNotifications=async(req,res,next)=>{
    try {
        const userId = req.user.id;

		await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted successfully" });
        
    } catch (error) {
        next(error);
    }
    
}


export const deleteNotification=async(req,res,next)=>{
    try {
       const NotificationId=req.params.id;
       const userId=req.user.id;

       const notification = Notification.findById(NotificationId);
       if(!notification){
           return next(errorHandler(404,"Notification not found"));
       }
        

       if(notification.to.toString() !== userId.toString()) {
        return next(errorHandler(401,"You are not authorized to delete this notification"));
       }

       await Notification.findByIdAndDelete(NotificationId);
       res.status(200).json({ message: "Notification deleted successfully" });
       
    } catch (error) {
       next(error); 
    }
}