import "dotenv/config"
import app from "./src/app.js"
import connectToDB from "./src/config/database.js";
import { testAi } from "./src/services/ai.service.js";


const PORT = process.env.PORT || 3000;

testAi();

connectToDB()
    .catch((err) => {
        console.error("MongoDB connection faield:", err)
        process.exit(1);
    });

app.listen(PORT, ()=> {
    console.log(`Server is connected to port ${PORT}`)
})    
     
