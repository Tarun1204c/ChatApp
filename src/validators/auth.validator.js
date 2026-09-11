import { body, validationResult } from "express-validator";


export function validate(req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({erros: errors.array() });
    }
    next();
}

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),


    validate
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage("Please provide a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required"),

  validate
];
