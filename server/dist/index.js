"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@trpc/server/adapters/express");
const index_1 = require("./routers/index"); // Update path
const context_1 = require("./context"); // Update path
const db_1 = require("./db"); // Update path
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/trpc', (0, express_2.createExpressMiddleware)({ router: index_1.appRouter, createContext: context_1.createContext }));
console.log('tRPC Routes:', Object.keys(index_1.appRouter._def.procedures));
console.log('Adhan Router Procedures:', Object.keys(index_1.appRouter._def.procedures.adhan?._def?.procedures || {}));
console.log('Committee Router Procedures:', Object.keys(index_1.appRouter._def.procedures.committee?._def?.procedures || {}));
(0, db_1.connectDB)()
    .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});
exports.default = app;
