import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { PlayerController } from "../controllers/PlayerController";
import { validateTeamExists } from "../middleware/team";
import { validatePlayerExists } from "../middleware/player";

const router = Router();

router.param('teamId', 
  validateTeamExists)

router.post('/:teamId/players',
  authenticate,
  requireAdmin,
  body('name')
    .notEmpty().withMessage('El nombre del jugador es obligatorio'),
  body('lastName')
    .notEmpty().withMessage('El apellido del jugador es obligatorio'),
  body('number')
    .isNumeric().notEmpty().withMessage('El número del jugador es obligatorio'),
  body('curp')
    .notEmpty().withMessage('La CURP del jugador es obligatoria'),
  body('position')
    .notEmpty().withMessage('La posición del jugador es obligatoria'),
  
 handleInputErrors,
 PlayerController.createPlayer
)

router.get('/:teamId/players',
  authenticate,
  PlayerController.getTeamsPlayers
)

router.param('playerId', validatePlayerExists)

router.get('/:teamId/players/:playerId',
  authenticate,
  param('playerId').isMongoId().withMessage('El id no es válido'),
  handleInputErrors,
  PlayerController.getPlayerById
)

router.put('/:teamId/players/:playerId',
  authenticate,
  requireAdmin,
  param('playerId').isMongoId().withMessage('El id no es válido'),
  body('name')
    .notEmpty().withMessage('El nombre del jugador es obligatorio'),
  body('lastName')
    .notEmpty().withMessage('El apellido del jugador es obligatorio'),
  body('number')
    .isNumeric().notEmpty().withMessage('El número del jugador es obligatorio'),
  body('birthDate')
    .isDate().notEmpty().withMessage('La fecha de nacimiento es obligatoria'),
  body('position')
    .notEmpty().withMessage('La posición del jugador es obligatoria'),
  handleInputErrors,
  PlayerController.updatePlayer
)

router.delete('/:teamId/players/:playerId',
  authenticate,
  requireAdmin,
  param('playerId').isMongoId().withMessage('El id no es válido'),
  handleInputErrors,
  PlayerController.deletePlayer
)

export default router;