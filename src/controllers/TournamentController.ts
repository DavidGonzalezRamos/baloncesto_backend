import type { Request, Response } from 'express'
import Tournament from '../models/Tournament'

export class TournamentController {

  static createTournament = async (req: Request, res: Response) => {
    const tournamnet = new Tournament(req.body)

    //Asignar admin
    tournamnet.admin = req.user.id
    try {
      await tournamnet.save()
      res.send('Torneo creado correctamente')
    } catch (error) {
      console.log(error)
    }
  }

  static getAllTournaments= async (req: Request, res: Response) => {
    try {
      const tournaments = await Tournament.find({})
      res.json(tournaments)
    } catch (error) {
      console.log(error)
    }
  }

  static getTournamentById = async (req: Request, res: Response): Promise<void> => {
    const {id} = req.params
    try {
      const tournament = await Tournament.findById(id).populate('teams')
      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }
      res.json(tournament)
    } catch (error) {
      console.log(error)
    }
  }

  static updateTournament = async (req: Request, res: Response) => {
    const {id} = req.params
   try {
    const tournament = await Tournament.findById(id)

      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }

      if(tournament.admin.toString() !== req.user.id){
        const error = new Error('No autorizado')
        res.status(404).json({error: error.message})
        return
      }

      tournament.dateStart = req.body.dateStart
      tournament.dateEnd = req.body.dateEnd
      tournament.tournamentName = req.body.tournamentName
      await tournament.save()
      res.send('Torneo actualizado correctamente')
    } catch (error) {
      console.log(error)
    }
  }

  static deleteTournament = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
      const tournament = await Tournament.findById(id)

      if (!tournament) {
        res.status(404).json({ message: 'Torneo no encontrado' });
        return;
      }

      if(tournament.admin.toString() !== req.user.id){
        const error = new Error('No autorizado')
        res.status(404).json({error: error.message})
        return
      }
      
      await tournament.deleteOne()
      res.send('Torneo eliminado correctamente')
    } catch (error) {
      console.log(error)
    }
  }
}