import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id_user: number;
  role: string;
  [key: string]: any;
}

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers['authorization'];

    if (!token) {
      res.status(403).json({ message: 'Accès interdit: token manquant' });
      return;
    }

    const payload = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token, process.env.JWT_KEY as string, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded as JwtPayload);
      });
    });

    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Accès interdit: token invalide' });
  }
};

export default {
  verifyToken,
};