import type { Request, Response } from "express";
import Team from "../models/Team";
import Player from "../models/Player";
import fs from 'fs';

export class TeamController {

  static createTeam = async (req: Request, res: Response)=> {
    try {
      const { nameTeam } = req.body;

      // Verifica si el equipo ya existe en el torneo por su nombre
      const existingTeam = await Team.findOne({
          nameTeam,
          branchTeam: req.body.branchTeam,
          tournament: req.tournament.id,
      });

      // Si el equipo ya existe, devuelve un error
      if (existingTeam) {
          res.status(400).json({ error: 'El equipo ya existe en este torneo' });
          return;
      }
      const team = new Team(req.body)
      team.tournament = req.tournament.id
      req.tournament.teams.push(team.id)
      await Promise.allSettled([team.save(), req.tournament.save()])
      
      res.status(201).send('Equipo creado')
    } catch (error) {
      res.status(500).json({error: 'Error al crear el equipo'})
    }
  }

  static getTournamentsTeams = async (req: Request, res: Response)=> {
    try {
      const teams = await Team.find({tournament: req.tournament.id}).populate('tournament')
      res.json(teams)
    } catch (error) {
      res.status(500).json({error: 'Error al obterner los equipos'})
    }
  }

  static getTeamById = async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    try {
      if (req.team.tournament.toString() !== req.tournament.id) {
        res.status(404).json({ error: 'Acción no permitida' });
        return;
      }
      const team = await Team.findById(teamId).populate('players')
      if (!team) {
        res.status(404).json({ error: 'Equipo no encontrado' });
        return 
      }
      res.json(team)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el equipo' });
    }
  }

  static updateTeam = async (req: Request, res: Response)=> {
    try {
      if(req.team.tournament.toString() !== req.tournament.id) {
        res.status(404).json({error: 'Accion no permitida'})
         return
      }
      req.team.nameTeam = req.body.nameTeam
      req.team.nameCoach = req.body.nameCoach
      req.team.branchTeam = req.body.branchTeam
      await req.team.save()
      res.send('Equipo actualizado')
    } catch (error) {
      res.status(500).json({error: 'Error al actualizar el equipo'})
    }
  }

  static deleteTeam = async (req: Request, res: Response) => {
    try {

      // Verificar y eliminar archivos antes de eliminar el jugador
      const deleteFile = (filePath: string) => {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Eliminar el archivo
        }
      };

      // Obtener todos los jugadores asociados al equipo
      const players = await Player.find({ team: req.team.id });

      // Si hay jugadores, eliminar sus archivos
      if (players.length > 0) {
        players.forEach(player => {
          deleteFile(player.idCard);
          deleteFile(player.photoPlayer);
          deleteFile(player.schedulePlayer);
          deleteFile(player.examMed);
        });
      }

      // Eliminar a los jugadores asociados al equipo
      await Player.deleteMany({ team: req.team.id });
  
      // Eliminar el equipo y actualizar el torneo
      req.tournament.teams = req.tournament.teams.filter(t => t.toString() !== req.team.id.toString());
      await Promise.allSettled([req.team.deleteOne(), req.tournament.save()]);
  
      res.status(200).send('Equipo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el equipo:', error);
      res.status(500).json({ error: 'Error al eliminar el equipo' });
    }
  };
  
}