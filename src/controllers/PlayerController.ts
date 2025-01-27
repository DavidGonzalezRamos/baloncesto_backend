import type { Request, Response } from "express";
import Player, { IPlayer } from "../models/Player";
import fs from 'fs';
import Team from "../models/Team";
import { createTeamPDF } from "../utils/pdf";


export class PlayerController{

  static createPlayer = async (req: Request, res: Response) => {
    // Función para eliminar archivos del sistema
    const deleteFiles = (files: Express.Multer.File[] | undefined) => {
      if (files) {
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path); // Elimina el archivo
          }
        });
      }
    };

    try {
      // Validaciones para datos únicos
      const existingPlayerCURP = await Player.findOne({ curp: req.body.curp });
      const existingPlayerNumber = await Player.findOne({ number: req.body.number });
      const existingPlayerNumberIpn = await Player.findOne({ numberIpn: req.body.numberIpn });

      if (existingPlayerCURP) {
        deleteFiles(req.files?.['idCard']);
        deleteFiles(req.files?.['schedulePlayer']);
        deleteFiles(req.files?.['photoPlayer']);
        deleteFiles(req.files?.['examMed']);
         res.status(400).json({ error: 'El CURP ya está en uso por otro jugador' });
         return
      }
      if (existingPlayerNumber) {
        deleteFiles(req.files?.['idCard']);
        deleteFiles(req.files?.['schedulePlayer']);
        deleteFiles(req.files?.['photoPlayer']);
        deleteFiles(req.files?.['examMed']);
         res.status(400).json({ error: 'El número de jugador ya está en uso' });
         return
      }
      if (existingPlayerNumberIpn) {
        deleteFiles(req.files?.['idCard']);
        deleteFiles(req.files?.['schedulePlayer']);
        deleteFiles(req.files?.['photoPlayer']);
        deleteFiles(req.files?.['examMed']);
         res.status(400).json({ error: 'La boleta ya está en uso' });
         return
      }

      // Validación de archivos cargados
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const idCard = files['idCard']?.[0]?.path;
      const schedulePlayer = files['schedulePlayer']?.[0]?.path;
      const photoPlayer = files['photoPlayer']?.[0]?.path;
      const examMed = files['examMed']?.[0]?.path;

      if (!idCard || !schedulePlayer || !photoPlayer || !examMed) {
        deleteFiles(files['idCard']);
        deleteFiles(files['schedulePlayer']);
        deleteFiles(files['photoPlayer']);
        deleteFiles(files['examMed']);
         res.status(400).json({ error: 'Todos los archivos son obligatorios' });
         return
      }

      // Preparar datos para el nuevo jugador
      const newPlayerData = {
        ...req.body,
        idCard,
        schedulePlayer,
        photoPlayer,
        examMed,
      };

      const player = new Player(newPlayerData);
      player.team = req.team.id;

      // Asociar el jugador al equipo
      req.team.players.push(player.id);

      // Guardar jugador y equipo en la base de datos
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
    // Función para eliminar archivos del sistema
    const deleteFile = (filePath: string) => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };
    const deleteFiles = (files: Express.Multer.File[] | undefined) => {
      if (files) {
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path); // Elimina el archivo
          }
        });
      }
    };

    try {
      // Validar que el CURP, número o boleta no estén en uso por otro jugador
      const existingPlayerCURP = await Player.findOne({ curp: req.body.curp });
      if (existingPlayerCURP && existingPlayerCURP.id.toString() !== req.player.id.toString()) {
        deleteFiles(req.files?.['idCard']);
        deleteFiles(req.files?.['schedulePlayer']);
        deleteFiles(req.files?.['photoPlayer']);
        deleteFiles(req.files?.['examMed']);
         res.status(400).json({ error: 'El CURP ya está en uso por otro jugador' });
         return
      }

      const existingPlayerNumber = await Player.findOne({ number: req.body.number });
      if (existingPlayerNumber && existingPlayerNumber.id.toString() !== req.player.id.toString()) {
        deleteFiles(req.files?.['idCard']);
        deleteFiles(req.files?.['schedulePlayer']);
        deleteFiles(req.files?.['photoPlayer']);
        deleteFiles(req.files?.['examMed']);
         res.status(400).json({ error: 'El número de jugador ya está en uso' });
         return
      }

      const existingPlayerNumberIpn = await Player.findOne({ numberIpn: req.body.numberIpn });
      if (existingPlayerNumberIpn && existingPlayerNumberIpn.id.toString() !== req.player.id.toString()) {
        deleteFiles(req.files?.['idCard']);
        deleteFiles(req.files?.['schedulePlayer']);
        deleteFiles(req.files?.['photoPlayer']);
        deleteFiles(req.files?.['examMed']);
         res.status(400).json({ error: 'La boleta ya está en uso' });
         return
      }

      // Verificar si el jugador pertenece al equipo actual
      if (req.player.team.toString() !== req.team.id) {
         res.status(404).json({ error: 'Acción no permitida' });
         return
      }

      // Actualizar datos básicos del jugador
      req.player.name = req.body.name || req.player.name;
      req.player.lastName = req.body.lastName || req.player.lastName;
      req.player.number = req.body.number || req.player.number;
      req.player.curp = req.body.curp || req.player.curp;
      req.player.position = req.body.position || req.player.position;

      // Manejar actualización de archivos (si se suben nuevos archivos)
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files['idCard']) {
          deleteFile(req.player.idCard); // Eliminar archivo anterior
          req.player.idCard = files['idCard'][0].path; // Asignar nueva ruta
        }

        if (files['schedulePlayer']) {
          deleteFile(req.player.schedulePlayer);
          req.player.schedulePlayer = files['schedulePlayer'][0].path;
        }

        if (files['photoPlayer']) {
          deleteFile(req.player.photoPlayer);
          req.player.photoPlayer = files['photoPlayer'][0].path;
        }

        if (files['examMed']) {
          deleteFile(req.player.examMed);
          req.player.examMed = files['examMed'][0].path;
        }
      }

      // Guardar los cambios en la base de datos
      await req.player.save();

      res.status(201).send('Jugador actualizado correctamente');
    } catch (error) {
      //console.error('Error al actualizar jugador:', error);

      // Manejo de errores en caso de fallo
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        deleteFile(files['idCard']?.[0]?.path);
        deleteFile(files['schedulePlayer']?.[0]?.path);
        deleteFile(files['photoPlayer']?.[0]?.path);
        deleteFile(files['examMed']?.[0]?.path);
      }

      res.status(500).json({ error: 'Error al actualizar el jugador' });
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

  static generateTeamPDF = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    try {
      // Buscar el equipo y jugadores con objetos planos
      const team = await Team.findById(teamId).populate("players").lean();

      if (!team) {
        //console.error("Team not found:", teamId);
        res.status(404).json({ error: "Equipo no encontrado" });
        return;
      }

      if (!team.players || team.players.length === 0) {
        //console.warn(`No players found for team ${teamId}`);
        res.status(404).json({ error: "No hay jugadores para este equipo" });
        return;
      }

      //console.log("Team data:", JSON.stringify(team, null, 2));

      // Generar el PDF
      const pdfBuffer = await createTeamPDF(team.nameTeam, team.players as IPlayer[]);

      // Configurar cabeceras y enviar respuesta
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=team-${teamId}.pdf`
      );

      res.send(pdfBuffer);

      //console.log("PDF enviado con éxito.");
    } catch (error) {
      //console.error("Error al generar el PDF:", error);
      res.status(500).json({
        error: error.message || "Error al generar el PDF",
      });
    }
  };
  
  
}