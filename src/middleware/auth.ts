import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import User, { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userRole?: string; // Agregar rol al request
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error('No autorizado');
    res.status(401).json({ error: error.message });
    return;
  }

  const token = bearer.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; role: string };

    if (decoded && decoded.id) {
      const user = await User.findById(decoded.id).select('_id name email role'); // Selecciona también el rol
      if (user) {
        req.user = user;
        req.userRole = user.role; // Almacena el rol en la request
        next();
      } else {
        res.status(500).json({ error: 'Token inválido' });
      }
    }

  } catch (error) {
    res.status(500).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar si el usuario es admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    return 
  }
  next();
};
