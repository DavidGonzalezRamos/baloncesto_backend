import type { Request, Response, NextFunction } from "express";
import Player, { IPlayer } from "../models/Player";

declare global {
  namespace Express {
    interface Request {
      player: IPlayer
    }
  }
}

export async function validatePlayerExists(req: Request, res: Response, next: NextFunction) {
try {
  const {playerId} = req.params;
    const player = await Player.findById(playerId);
    if (!player) {
      res.status(404).json({ message: 'Jugador no encontrado' });
      return;
    }
    req.player = player;
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }  
}