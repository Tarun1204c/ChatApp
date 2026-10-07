import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors"
import chatRouter from "./routes/chat.routes.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.set("trust proxy", 1);

const frontendDistPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../public/dist"
);

const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT_MAX) || 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            message: "Too many requests. Please try again later.",
            success: false,
            retryAfter: res.getHeader("Retry-After")
        });
    }
});

const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.CHAT_RATE_LIMIT_MAX) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            message: "Too many chat requests. Please try again later.",
            success: false,
            retryAfter: res.getHeader("Retry-After")
        });
    }
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "img-src": ["'self'", "data:"],
            "connect-src": ["'self'", "ws:", "wss:"],
        }
    }
}));
app.use(express.urlencoded({ extended: true }));
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

app.use("/api", apiRateLimiter);
app.use("/api/auth", express.json());
app.use("/api/chats/message", chatRateLimiter);
app.use("/api/chats", express.json({ limit: "8mb" }));
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

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error",
        success: false
    });
});

export default app;