import { Router } from "express";
import { MatchController } from "../controllers/MatchController";
import { validateTournamentExists } from "../middleware/tournament";
import { authenticate, requireAdmin } from "../middleware/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { validateMatchExists } from "../middleware/match";

const router = Router();

router.param('tournamentId', 
  validateTournamentExists)

router.post('/:tournamentId/matches',
  authenticate,
  requireAdmin,
  body('teamLocal')
    .notEmpty().withMessage('El equipo local es obligatorio'),
  body('teamVisitor')
    .notEmpty().withMessage('El equipo visitante es obligatorio'),
  body('scoreLocal')
    .isNumeric().notEmpty().withMessage('El marcador del equio local es obligatorio'),
  body('scoreVisitor')
    .isNumeric().notEmpty().withMessage('El marcador del equipo visitante es obligatorio'),
  body('teamWinner')
    .notEmpty().withMessage('El equipo ganador es obligatorio'),
  body('date')
  .isDate().notEmpty().withMessage('La fecha de inicio es requerida'),
  body('place')
    .notEmpty().withMessage('El lugar es obligatorio'),
  body('branchMatch')
    .notEmpty().withMessage('La rama es obligatoria'),
  handleInputErrors,
  MatchController.createMatch
)

router.get('/:tournamentId/matches',
  authenticate,
  MatchController.getTournamnetMatches
)

router.param('matchId', validateMatchExists)

router.get('/:tournamentId/matches/:matchId',
  authenticate,
    param('matchId').isMongoId().withMessage('El id no es valido'),
    handleInputErrors,  
  MatchController.getMatchById
)

router.put('/:tournamentId/matches/:matchId',
  authenticate,
  requireAdmin,
  param('matchId').isMongoId().withMessage('El id no es valido'),
  body('teamLocal')
    .notEmpty().withMessage('El equipo local es obligatorio'),
  body('teamVisitor')
    .notEmpty().withMessage('El equipo visitante es obligatorio'),
  body('scoreLocal')
    .isNumeric().notEmpty().withMessage('El marcador del equio local es obligatorio'),
  body('scoreVisitor')
    .isNumeric().notEmpty().withMessage('El marcador del equipo visitante es obligatorio'),
  body('teamWinner')
    .notEmpty().withMessage('El equipo ganador es obligatorio'),
  body('date')
  .isDate().notEmpty().withMessage('La fecha de inicio es requerida'),
  body('place')
    .notEmpty().withMessage('El lugar es obligatorio'),
  handleInputErrors,
  MatchController.updateMatch
)

router.delete('/:tournamentId/matches/:matchId',
  authenticate,
  requireAdmin,
  param('matchId').isMongoId().withMessage('El id no es valido'),  
  handleInputErrors,
  MatchController.deleteMatch
)

router.post('/:tournamentId/matches/:matchId/status',
  authenticate,
  requireAdmin,
  param('matchId').isMongoId().withMessage('El id no es valido'),  
  body('status')
    .notEmpty().withMessage('El estado es obligatorio'),
  handleInputErrors,
  MatchController.updateMatchStatus
)

export default router