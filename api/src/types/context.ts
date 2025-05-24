import { Request, Response } from 'express';

export interface MyContext {
  req: Request & {
    user?: {
      id_user: number;
      role: string;
      email?: string;
    };
  };
  res: Response;
}
