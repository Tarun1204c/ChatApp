import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI} from "@langchain/mistralai"
import { AIMessage, HumanMessage, SystemMessage } from "langchain";

const geminiModel = new ChatGoogle({
    model:"gemini-3.5-flash",
    apiKey: process.env.GOOGLE_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "ministral-3b-2512",
    apiKey: process.env.MISTRAL_API_KEY
})


export async function* generateResponse(messages){
    const conversation = messages.map((message) => (
        message.role === "user"
            ? new HumanMessage(message.content)
            : new AIMessage(message.content)
    ));

    const responseStream = await geminiModel.stream(conversation);

    for await (const chunk of responseStream) {
        const text = typeof chunk.content === "string"
            ? chunk.content
            : chunk.text || "";

        if (text) {
            yield text;
        }
    }
}

export async function generateChatTitle(message){

    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive title for chat conversation.

            Generate a clear, relevant title in 3-5 words based on the user's first message.
            `),
            
            new HumanMessage(`
                Generate a title for a chat conversation based on the following first message:
                "${message}"
                `)
    ])

    return response.text

}
