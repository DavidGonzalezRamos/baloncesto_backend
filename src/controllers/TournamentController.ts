import type { Request, Response } from 'express';
import Tournament from '../models/Tournament';
import Player from '../models/Player';
import Team from '../models/Team';
import Match from '../models/Match';
import fs from 'fs';

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

  static deleteTournament = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      
      const tournament = await Tournament.findById(id).populate('teams');
  
      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }
  
      // Verificar que el usuario sea el administrador del torneo
      if (tournament.role.toString() !== req.user.id) {
        res.status(403).json({ error: 'No autorizado' });
        return;
      }
  
      const teamIds = tournament.teams.map((team: any) => team._id);
  
      // Verificar y eliminar archivos antes de eliminar el jugador
      const deleteFile = (filePath: string) => {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Eliminar el archivo
        }
      };

      // Obtener todos los jugadores asociados al equipo
      const players = await Player.find({ team: { $in: teamIds } });

      // Si hay jugadores, eliminar sus archivos
      if (players.length > 0) {
        players.forEach(player => {
          deleteFile(player.idCard);
          deleteFile(player.photoPlayer);
          deleteFile(player.schedulePlayer);
          deleteFile(player.examMed);
        });
      }
      await Player.deleteMany({ team: { $in: teamIds } });
      await Team.deleteMany({ _id: { $in: teamIds } });
      await Match.deleteMany({ tournament: id });
      await tournament.deleteOne();
  
      res.status(200).send('Torneo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el torneo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al eliminar el torneo' });
      }
    }
  };
}
