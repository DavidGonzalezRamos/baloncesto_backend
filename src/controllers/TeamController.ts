import type { Request, Response } from "express";
import Tournament from "../models/Tournament";
import Team from "../models/Team";

export class TeamController {

  static createTeam = async (req: Request, res: Response)=> {
    try {
      const team = new Team(req.body)
      team.tournament = req.tournament.id
      req.tournament.teams.push(team.id)
      await Promise.allSettled([team.save(), req.tournament.save()])
      res.send('Equipo creado')
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
      res.status(500).json({error: 'Error al obtener el equipo'})
    }
  }

  static deleteTeam = async (req: Request, res: Response)=> {
    try {
      req.tournament.teams = req.tournament.teams.filter(t => t.toString() !== req.team.id.toString())
      await Promise.allSettled([req.team.deleteOne(), req.tournament.save()])
      res.send('Equipo eliminado')
    } catch (error) {
      res.status(500).json({error: 'Error al obtener el equipo'})
    }
  }
}