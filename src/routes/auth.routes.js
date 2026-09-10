import { Router } from "express";
import { register, verifyEmail } from "../controllers/auth.contoller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);

authRouter.post('/login', loginValidator, login)

authRouter.get("/verify-email", verifyEmail);



export default authRouter;
