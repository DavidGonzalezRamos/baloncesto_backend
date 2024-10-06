import type { Request, Response, NextFunction } from "express";
import Team, {ITeam} from "../models/Team";

declare global {
  namespace Express {
    interface Request {
      team: ITeam
    }
  }
}

export async function validateTeamExists(req: Request, res: Response, next: NextFunction) {
try {
  const {teamId} = req.params;
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Equipo no encontrado' });
      return;
    }
    req.team = team;
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }  
}