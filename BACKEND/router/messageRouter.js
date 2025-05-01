import express from "express";
import {
     getAllmessages, 
     sendMessage 
    } from "../controller/messageController.js";
    import {isAdminAuthenticated} from "../middlewares/auth.js"
const router=express.Router();

router.post("/send",sendMessage);
router.get("/getall",isAdminAuthenticated,getAllmessages)
export default router;