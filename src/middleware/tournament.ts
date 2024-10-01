import type { Request, Response, NextFunction } from "express";
import Tournament, {ITournament} from "../models/Tournament";

declare global {
  namespace Express {
    interface Request {
      tournament: ITournament
    }
  }
}

export async function validateTournamentExists(req: Request, res: Response, next: NextFunction) {
try {
  const {tournamentId} = req.params;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      res.status(404).json({ message: 'Torneo no encontrado' });
      return;
    }
    req.tournament = tournament;
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }  
}