import {Router} from "express";
import { sendMessage, getChatMessages } from "../controllers/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const chatRouter = Router();


chatRouter.post("/message", authUser , sendMessage)
chatRouter.get("/:chatId/messages", authUser, getChatMessages)



export default chatRouter