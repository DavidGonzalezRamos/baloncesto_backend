import type { Request, Response } from 'express';
import Tournament from '../models/Tournament';

export class TournamentController {

  static createTournament = async (req: Request, res: Response) => {
    try {
      const tournament = new Tournament(req.body);

      // Asignar role desde el token del usuario autenticado
      tournament.role = req.user.id;

      await tournament.save();
      res.status(201).send('Torneo creado correctamente');
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error al crear el torneo' });
    }
  }

  static getAllTournaments = async (req: Request, res: Response) => {
    try {
      const tournaments = await Tournament.find({});
      res.json(tournaments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los torneos' });
    }
  }

  static getTournamentById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const tournament = await Tournament.findById(id).populate('teams');
      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }
      res.json(tournament);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el torneo' });
    }
  }

  static updateTournament = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const tournament = await Tournament.findById(id);

      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }

      // Verificar que el usuario sea el administrador del torneo
      if (tournament.role.toString() !== req.user.id) {
        res.status(403).json({ error: 'No autorizado' });
        return;
      }

      // Actualizar datos del torneo
      tournament.dateStart = req.body.dateStart || tournament.dateStart;
      tournament.dateEnd = req.body.dateEnd || tournament.dateEnd;
      tournament.tournamentName = req.body.tournamentName || tournament.tournamentName;

      await tournament.save();
      res.status(200).send('Torneo actualizado correctamente');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el torneo' });
    }
  }

  static deleteTournament = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const tournament = await Tournament.findById(id);

      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }

      // Verificar que el usuario sea el administrador del torneo
      if (tournament.role.toString() !== req.user.id) {
        res.status(403).json({ error: 'No autorizado' });
        return;
      }

      await tournament.deleteOne();
      res.status(200).send('Torneo eliminado correctamente');
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al eliminar el torneo' });
      }
    }
  }
}
