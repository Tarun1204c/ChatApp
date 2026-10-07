import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors"
import chatRouter from "./routes/chat.routes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const frontendDistPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../public/dist"
);

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://chatapp-3tlo.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use(express.static(frontendDistPath));


app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

app.use((req, res, next) => {
    if (
        req.method !== "GET" ||
        req.path === "/api" ||
        req.path.startsWith("/api/")
    ) {
        return next();
    }

    res.sendFile(path.join(frontendDistPath, "index.html"), (error) => {
        if (error) {
            next(error);
        }
    });
});





export default app;