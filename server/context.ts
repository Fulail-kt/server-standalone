// import { inferAsyncReturnType } from '@trpc/server';

// export const createContext = () => {
//   return {};
// };

// export type Context = inferAsyncReturnType<typeof createContext>;

import { inferAsyncReturnType } from '@trpc/server';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET =process.env.JWT_SECRET || 'bigSecret';


export const createContext = ({ req }: { req: Request }) => {
  const token = req.headers.authorization?.split(' ')[1];
  let user = null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      user = { userId: payload.userId };
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  return { user };
};

export type Context = inferAsyncReturnType<typeof createContext>;