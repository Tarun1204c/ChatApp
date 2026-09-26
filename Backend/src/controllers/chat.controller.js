import { generateChatTitle, generateResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
    const { message, chat: chatId } = req.body;

    try {

        let title = null, chat;

        if(!chatId){
            title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title
            });
        } else {
            chat = await chatModel.findOne({
                _id: chatId,
                user: req.user.id,
                status: "active"
            });

            if (!chat) {
                return res.status(404).json({
                    message: "Chat not found",
                    success: false
                });
            }
        }

        res.status(200);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        let result = "";
        const messages = await messageModel
            .find({ chat: chat._id })
            .sort({ createdAt: 1 });
        messages.push({
            role: "user",
            content: message
        });


        for await (const token of generateResponse(messages)) {
            result += token;
            res.write(`event: token\ndata: ${JSON.stringify(token)}\n\n`);
        }

        const userMessage = await messageModel.create({
            chat: chat._id,
            content: message,
            role: "user"

        })

        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: result,
            role: "ai"
        });

        res.write(`event: done\ndata: ${JSON.stringify({ title, chat, aiMessage })}\n\n`);
        res.end();

    } catch (error) {
        console.error("AI response failed:", error);

        if (res.headersSent) {
            res.write(`event: error\ndata: ${JSON.stringify({
                message: error.statusCode === 429 || error.code === 429
                    ? "AI quota exceeded. Please try again later."
                    : "Failed to generate AI response"
            })}\n\n`);
            return res.end();
        }

        if (error.statusCode === 429 || error.code === 429) {
            return res.status(429).json({
                message: "AI quota exceeded. Please try again later.",
                success: false,
                retryAfter: error.headers?.["retry-after"] || null
            });
        }

        res.status(500).json({
            message: "Failed to generate AI response",
            success: false
        });
    }
}

export async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
        message: "Chats retrieved successfully",
        success: true,
        chats,
    });
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id,
        status: "active",
    });

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found",
            success: false,
        });
    }

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    return res.status(200).json({
        message: "Messages retrieved successfully",
        success: true,
        chat,
        messages,
    });
}

export async function deleteChat(req,res){

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if(!chat){
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })

}


