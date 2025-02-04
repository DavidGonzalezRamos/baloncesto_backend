import type { Request, Response, NextFunction } from "express";
import Match, {IMatch} from "../models/Match";

declare global {
  namespace Express {
    interface Request {
      match: IMatch
    }
  }
}

export async function validateMatchExists(req: Request, res: Response, next: NextFunction) {
try {
  const {matchId} = req.params;
    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partido no encontrado' });
      return;
    }
    req.match = match;
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }  
}