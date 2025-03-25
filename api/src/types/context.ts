import { Request, Response } from 'express';

interface MyContext {
  req: Request & {
    user?: {
      id_user: number;
      role: string;
      [key: string]: any;
    };
  };
  res: Response;
}

export { MyContext };