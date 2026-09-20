import { generateResponse, generateChatTitle } from "../services/ai.service.js"


export async function sendMessage(req, res){

    const {message} = req.body

    try {

        const title = await generateChatTitle(message);

        console.log(title)

        const result = await generateResponse(message);

        res.json({
            aimessage: result,
            title
        })
    } catch (error) {
        console.error("AI response failed:", error)
        res.status(500).json({
            message: "Failed to generate AI response",
            success: false
        })
    }
}



