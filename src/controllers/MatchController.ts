import type { Request, Response } from 'express'
import Match from '../models/Match'
import Team from '../models/Team'

export class MatchController {
  static createMatch = async (req: Request, res: Response) => {
    try {
      const { teamLocal, teamVisitor}= req.body
      const exisitingTeamLocal = await Team.findOne({nameTeam: teamLocal, tournament: req.tournament.id})
      const exisitingTeamVisitor = await Team.findOne({nameTeam: teamVisitor, tournament: req.tournament.id})
      if (!exisitingTeamLocal || !exisitingTeamVisitor) {
        res.status(400).json({ error: 'El o los equipos no existen' })
        return
      }
      const sameBranch = exisitingTeamLocal.branchTeam === exisitingTeamVisitor.branchTeam
      if (!sameBranch) {
        res.status(400).json({ error: 'Los equipos no pertenecen a la misma rama' })
        return
      }
      const match = new Match(req.body)
      match.tournament= req.tournament.id
      req.tournament.matches.push(match.id)
      Promise.allSettled([match.save(), req.tournament.save()])

      res.status(201).send('Partido creado correctamente')
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el partido' });
    }
  }

  static getTournamnetMatches = async (req: Request, res: Response) => {
    try {
      const matches = await Match.find({tournament: req.tournament.id}).populate('tournament')
      res.json(matches)
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los partidos' });
    }
  }

  static getMatchById = async (req: Request, res: Response) => {
    const {matchId} = req.params
    try {
      if (req.match.tournament.toString() !== req.tournament.id) {
        res.status(404).json({ error: 'Acción no permitida' });
        return;
      }
      const match = (await Match.findById(matchId))
      if (!match) {
        res.status(404).json({ error: 'Partido no encontrado' });
        return 
      }
      res.json(match)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el partido' });
    }
  }

  static updateMatch = async (req: Request, res: Response) => {
    try {
      const {matchId} = req.params
      const match = await Match.findById(matchId)
      if(!match) {
        res.status(404).json({error: 'Partido no encontrado'})
        return
      }
      if (req.match.tournament.toString() !== req.tournament.id) {
        res.status(404).json({ error: 'Acción no permitida' });
        return;
      }

      req.match.teamLocal = req.body.teamLocal
      req.match.teamVisitor = req.body.teamVisitor
      req.match.scoreLocal = req.body.scoreLocal
      req.match.scoreVisitor = req.body.scoreVisitor
      req.match.teamWinner = req.body.teamWinner
      req.match.date = req.body.date
      req.match.place = req.body.place
      await req.match.save()
      res.send('Partido actualizado')
    } catch (error) {
      res.status(500).json({error: 'Error al actualizar el equipo'})
    }
  }

  static deleteMatch = async (req: Request, res: Response) => {
    try {
      const {matchId} = req.params
      const match = await Match.findById(matchId)
      if(!match) {
        res.status(404).json({error: 'Partido no encontrado'})
        return
      }
      req.tournament.matches = req.tournament.matches.filter(match => match.toString() !== matchId)
      await Promise.allSettled([req.tournament.save(), match.deleteOne()])
      res.send('Partido eliminado')
    } catch (error) {
      res.status(500).json({error: 'Error al eliminar el partido'})
    }
  }

  static updateMatchStatus = async (req: Request, res: Response) => {
    try {
      const {matchId} = req.params
      const {status} = req.body
      const match = await Match.findById(matchId)
      if(!match) {
        res.status(404).json({error: 'Partido no encontrado'})
        return
      }
      match.status = status
      await match.save()
      res.send('Estado del partido actualizado')
    } catch (error) {
      res.status(500).json({error: 'Error al actualizar el partido'})
    }
  }
}