import type { Request, Response } from "express";
import Player from "../models/Player";
import fs from 'fs';
import path from 'path';

export class PlayerController{

  static createPlayer = async (req: Request, res: Response) => {
    try {
      const existingPlayer = await Player.findOne({ curp: req.body.curp });
      
      if (existingPlayer) {
        res.status(400).json({ error: 'El CURP ya está en uso por otro jugador' });
        return;
      }
  
      // Afirmar que req.files es de tipo { [fieldname: string]: Express.Multer.File[] }
      const { idCard, schedulePlayer, photoPlayer, examMed } = req.files as { 
        [fieldname: string]: Express.Multer.File[] 
      };
  
      if (!idCard || !schedulePlayer || !photoPlayer || !examMed) {
        res.status(400).json({ error: 'Todos los archivos son obligatorios' });
        return
      }
  
      // Crear el jugador con los datos y las rutas de los archivos
      const newPlayerData = {
        ...req.body,
        idCard: idCard[0].path, // Ruta del archivo (si usas `multer` para almacenar en disco)
        schedulePlayer: schedulePlayer[0].path,
        photoPlayer: photoPlayer[0].path,
        examMed: examMed[0].path,
      };
  
      // Crear el nuevo jugador
      const player = new Player(newPlayerData);
      player.team = req.team.id;
  
      // Asociar el jugador al equipo y guardar ambos
      req.team.players.push(player.id);
      await Promise.allSettled([player.save(), req.team.save()]);
  
      res.status(201).send('Jugador creado');
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el jugador' });
    }
  };
  

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
      // Verificar si el CURP ya está en uso
      const existingPlayer = await Player.findOne({ curp: req.body.curp });
      if (existingPlayer && existingPlayer.id.toString() !== req.player.id.toString()) {
        res.status(400).json({ error: 'El CURP ya está en uso por otro jugador' });
        return
      }
      
      if(req.player.team.toString() !== req.team.id) {
        res.status(404).json({error: 'Accion no permitida'})
         return
      }
      // Actualizar datos básicos del jugador
      req.player.name = req.body.name || req.player.name;
      req.player.lastName = req.body.lastName || req.player.lastName;
      req.player.number = req.body.number || req.player.number;
      req.player.curp = req.body.curp || req.player.curp;
      req.player.position = req.body.position || req.player.position;
  
      const deleteFile = (filePath: string) => {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Eliminar el archivo
        }
      };
      
      // Manejar actualización de archivos
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
        // Eliminar y actualizar cada archivo
        if (files.idCard) {
          deleteFile(req.player.idCard); // Eliminar archivo viejo
          req.player.idCard = files.idCard[0].path; // Guardar nueva ruta
        }
        if (files.schedulePlayer) {
          deleteFile(req.player.schedulePlayer);
          req.player.schedulePlayer = files.schedulePlayer[0].path;
        }
        if (files.photoPlayer) {
          deleteFile(req.player.photoPlayer);
          req.player.photoPlayer = files.photoPlayer[0].path;
        }
        if (files.examMed) {
          deleteFile(req.player.examMed);
          req.player.examMed = files.examMed[0].path;
        }
      }
  
      // Guardar cambios en la base de datos
      await req.player.save();
      //console.log('Jugador actualizado:', req.player);
  
      res.send('Jugador actualizado')
    } catch (error) {
      //console.error('Error al actualizar jugador:', error);
      res.status(500).json({error: 'Error al obtener el jugador'})
    }
  };
  
  
  

  static deletePlayer = async (req: Request, res: Response) => {
    try {
      // Verificar y eliminar archivos antes de eliminar el jugador
      const deleteFile = (filePath: string) => {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Eliminar el archivo
        }
      };
  
      // Eliminar los archivos del jugador, si existen
      deleteFile(req.player.idCard);
      deleteFile(req.player.photoPlayer);
      deleteFile(req.player.schedulePlayer);
      deleteFile(req.player.examMed);
  
      // Eliminar al jugador de la lista de jugadores del equipo
      req.team.players = req.team.players.filter(t => t.toString() !== req.player.id.toString());
  
      // Eliminar el jugador y guardar el equipo
      await Promise.allSettled([req.player.deleteOne(), req.team.save()]);
  
      res.send('Jugador eliminado');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el jugador' });
    }
  }
}