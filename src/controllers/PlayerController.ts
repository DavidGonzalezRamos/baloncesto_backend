import type { Request, Response } from "express";
import Player from "../models/Player";

export class PlayerController{

  static createPlayer = async (req: Request, res: Response) => {
    try {
      const existingPlayer = await Player.findOne({ curp: req.body.curp });
      
      if (existingPlayer) {
        res.status(400).json({ error: 'El CURP ya está en uso por otro jugador' });
        return 
      }
  
      // Si no existe, proceder a crear el jugador
      const player = new Player(req.body);
      player.team = req.team.id;
  
      // Asociar el jugador al equipo y guardar ambos
      req.team.players.push(player.id);
      await Promise.allSettled([player.save(), req.team.save()]);
  
      res.status(201).send('Jugador creado');
    } catch (error) {
      // Manejo de errores genéricos
      res.status(500).json({ error: 'Error al crear el jugador' });
    }
  }
  

  static getTeamsPlayers = async (req: Request, res: Response) => {
    try {
      const players = await Player.find({team: req.team.id}).populate('team')
      res.json(players)
    } catch (error) {
      res.status(500).json({error: 'Error al obterner los equipos'})
    }
  }

  static getPlayerById = async (req: Request, res: Response) => {
    try {
      if(req.player.team.toString() !== req.team.id) {
        res.status(404).json({error: 'Accion no permitida'})
         return
      }
      res.json(req.player)
    } catch (error) {
      res.status(500).json({error: 'Error al obtener el jugador'})
    }
  }

  static updatePlayer = async (req: Request, res: Response) => {
    try {
      const existingPlayer = await Player.findOne({ curp: req.body.curp });
      
      if (existingPlayer && existingPlayer.id.toString() !== req.player.id.toString()) {
        res.status(400).json({ error: 'El CURP ya está en uso por otro jugador' });
        return 
      }
      
      if(req.player.team.toString() !== req.team.id) {
        res.status(404).json({error: 'Accion no permitida'})
         return
      }
      req.player.name= req.body.name
      req.player.lastName= req.body.lastName
      req.player.number= req.body.number
      req.player.curp= req.body.curp  
      req.player.position= req.body.position
      await req.player.save()
      res.send('Jugador actualizado')
    } catch (error) {
      res.status(500).json({error: 'Error al obtener el jugador'})
    }
  }

  static deletePlayer = async (req: Request, res: Response) => {
    try {
      req.team.players = req.team.players.filter(t => t.toString() !== req.player.id.toString())
      await Promise.allSettled([req.player.deleteOne(), req.team.save()])
      res.send('Jugador eliminado')
    } catch (error) {
      res.status(500).json({error: 'Error al obtener el jugador'})
    }
  }
}