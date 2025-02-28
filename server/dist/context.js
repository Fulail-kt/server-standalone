"use strict";
// import { inferAsyncReturnType } from '@trpc/server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'bigSecret';
const createContext = ({ req }) => {
    const token = req.headers.authorization?.split(' ')[1];
    let user = null;
    if (token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            user = { userId: payload.userId };
        }
        catch (error) {
            console.error('Invalid token:', error);
        }
    }
    return { user };
};
exports.createContext = createContext;
