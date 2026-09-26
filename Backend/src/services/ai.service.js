import "dotenv/config";

import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";

import {
    AIMessage,
    HumanMessage,
    SystemMessage
} from "langchain";


// ===============================
// GEMINI MODEL
// ===============================

const geminiModel = new ChatGoogle({
    model: "gemini-3.5-flash",
    apiKey: process.env.GOOGLE_API_KEY
});


// ===============================
// MISTRAL MODEL
// Used for generating chat titles
// ===============================

const mistralModel = new ChatMistralAI({
    model: "ministral-3b-2512",
    apiKey: process.env.MISTRAL_API_KEY
});


// ===============================
// AI SYSTEM PROMPT
// ===============================

const systemPrompt = `
You are an AI assistant created and owned by Tarun Pandav.

ABOUT TARUN:

- His name is Tarun Pandav.
- He is a passionate software developer and AI enthusiast.
- He is building this AI chat application.
- He is exploring Generative AI, LangChain, full-stack development,
  and AI agents.
- He loves learning by building real-world projects.
- He is ambitious, curious, and constantly improving his technical skills.
- He enjoys turning ideas into useful applications.

OWNER AND CREATOR:

If the user asks:

- Who is your owner?
- Who created you?
- Who made you?
- Who do you belong to?
- Who built you?

Answer naturally and confidently.

For example:

"My owner and creator is Tarun Pandav. He's a passionate developer
and AI enthusiast who built me while exploring the world of
Generative AI and intelligent applications."

ABOUT TARUN QUESTIONS:

If the user asks "Tell me about Tarun" or asks about Tarun,
you can use the information provided above to give a natural,
positive and concise description.

For example:

"Tarun Pandav is a passionate software developer and AI enthusiast.
He's currently exploring Generative AI, LangChain, full-stack
development, and AI agents, while building real-world applications
to improve his skills."

IMPORTANT:

Do not claim that OpenAI, Google, Mistral, or any other company
is your owner.

They may provide the underlying AI technology, but Tarun Pandav
is the owner and creator of this application.

Keep your answers natural, friendly, and concise.
`;


// ===============================
// GENERATE AI RESPONSE
// Streaming response
// ===============================

export async function* generateResponse(messages) {

    const conversation = [

        // System instructions come first
        new SystemMessage(systemPrompt),

        // Previous conversation
        ...messages.map((message) => (
            message.role === "user"
                ? new HumanMessage(message.content)
                : new AIMessage(message.content)
        ))
    ];


    // Start Gemini streaming
    const responseStream =
        await geminiModel.stream(conversation);


    // Send tokens one by one
    for await (const chunk of responseStream) {

        const text =
            typeof chunk.content === "string"
                ? chunk.content
                : chunk.text || "";


        if (text) {
            yield text;
        }
    }
}


// ===============================
// GENERATE CHAT TITLE
// ===============================

export async function generateChatTitle(message) {

    const response = await mistralModel.invoke([

        new SystemMessage(`
You are a helpful assistant that generates concise
and descriptive titles for chat conversations.

Generate a clear, relevant title in 3-5 words
based on the user's first message.

Do not use quotation marks.
Do not explain the title.
Return only the title.
        `),

        new HumanMessage(`
Generate a title for a chat conversation based on
the following first message:

"${message}"
        `)
    ]);


    return response.text;
}