import "dotenv/config"
import app from "./src/app.js"
import http from "http";
import connectToDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";



const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

initSocket(httpServer)



connectToDB()
    .catch((err) => {
        console.error("MongoDB connection faield:", err)
        process.exit(1);
    });

httpServer.listen(PORT, ()=> {
    console.log(`Server is connected to port ${PORT}`)
})    
     
