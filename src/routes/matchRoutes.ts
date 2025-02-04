import { Router } from "express";
import { MatchController } from "../controllers/MatchController";
import { validateTournamentExists } from "../middleware/tournament";
import { authenticate } from "../middleware/auth";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.param('tournamentId', 
  validateTournamentExists)

router.post('/:tournamentId/matches',
  authenticate,
  body('teamLocal')
    .notEmpty().withMessage('El equipo local es obligatorio'),
  body('teamVisitor')
    .notEmpty().withMessage('El equipo visitante es obligatorio'),
  body('score')
    .isNumeric().notEmpty().withMessage('El marcador es obligatorio'),
  body('teamWinner')
    .notEmpty().withMessage('El equipo ganador es obligatorio'),
  body('date')
  .isDate().notEmpty().withMessage('La fecha de inicio es requerida'),
  body('place')
    .notEmpty().withMessage('El lugar es obligatorio'),
  handleInputErrors,
  MatchController.createMatch
)

export default router