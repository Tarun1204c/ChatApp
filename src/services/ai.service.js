import "dotenv/config";
import { ChatGoogle } from "@langchain/google";

const model = new ChatGoogle({
    model:"gemini-3.6-flash",
    apikey:process.env.GOOGLE_API_KEY
})

export async function testAi(){
    model.invoke("What is the capital of FRANCE?").then((response) => {
        console.log(response.text);
    })
}
