import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/index'; // Update path
import { createContext } from './context'; // Update path
import { connectDB } from './db'; // Update path

const app = express();

app.use(cors());
app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));

console.log('tRPC Routes:', Object.keys(appRouter._def.procedures));
console.log('Adhan Router Procedures:', Object.keys(appRouter._def.procedures.adhan?._def?.procedures || {}));
console.log('Committee Router Procedures:', Object.keys(appRouter._def.procedures.committee?._def?.procedures || {}));

connectDB()
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

export default app;