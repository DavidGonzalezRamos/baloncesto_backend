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
}