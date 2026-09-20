import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI} from "@langchain/mistralai"
import { HumanMessage, SystemMessage } from "langchain";

const geminiModel = new ChatGoogle({
    model:"gemini-3.6-flash",
    apiKey: process.env.GOOGLE_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "ministral-3b-2512",
    apikey: process.env.MISTRAL_API_KEY
})


export async function generateResponse(message){

    const response = await geminiModel.invoke([
        new HumanMessage(message)
    ]);

    return response.text
}

export async function generateChatTitle(message){

    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a hel[ful assistant that generates concise and descriptive title for cchat conversation.


        user will provide you with the first message of a chat conversation, and you will generate the title that captures the essance of the conversation in 3-5 words. the title should be clear, relevant, and engaging,
        giving user a quick understanding of the chat's topic
            `),
            
            new HumanMessage(`
                Generate a title for a chat conversation based on the follwing first message
                "${message}"
                `)
    ])

    return response.text

}
