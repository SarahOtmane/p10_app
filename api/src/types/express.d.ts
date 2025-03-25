import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id_user: number;
      role: string;
      [key: string]: any;
    };
  }
}