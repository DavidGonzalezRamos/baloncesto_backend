import {Router} from 'express';
import {body, param} from 'express-validator'
import { TournamentController } from '../controllers/TournamentController';
import { handleInputErrors } from '../middleware/validation';
import { TeamController } from '../controllers/TeamController';
import { validateTournamentExists } from '../middleware/tournament';
import { validateTeamExists } from '../middleware/team';

const router = Router();

router.post('/', 
  body('dateStart')
  .isDate().notEmpty().withMessage('La fecha de inicio es requerida'),
  
  body('dateEnd')
  .isDate().notEmpty().withMessage('La fecha de termino es requerida'),
  
  body('tournamentName')
  .notEmpty().withMessage('El nombre del torneo es requerido'),
  
  handleInputErrors,
  TournamentController.createTournament
);

router.get('/', TournamentController.getAllTournaments);

router.get('/:id',
  param('id').isMongoId().withMessage('El id no es valido'),  
  handleInputErrors, 
  TournamentController.getTournamentById
);

router.put('/:id',
  param('id').isMongoId().withMessage('El id no es valido'),  
  body('dateStart')
    .isDate().notEmpty().withMessage('La fecha de inicio es requerida'),
  
  body('dateEnd')
    .isDate().notEmpty().withMessage('La fecha de termino es requerida'),
  
  body('tournamentName')
    .notEmpty().withMessage('El nombre del torneo es requerido'),
  handleInputErrors, 
  TournamentController.updateTournament
)

router.delete('/:id',
  param('id').isMongoId().withMessage('El id no es valido'),  
  handleInputErrors, 
  TournamentController.deleteTournament
)

// Routes for Teams
router.param('tournamentId', validateTournamentExists)

router.post('/:tournamentId/teams',
   body('nameTeam')
    .notEmpty().withMessage('El nombre del equipo es requerido'),
  body('nameCoach')
    .notEmpty().withMessage('El nombre del coach es requerido'),

  handleInputErrors,
  TeamController.createTeam
)

router.get('/:tournamentId/teams',
  TeamController.getTournamentsTeams
)

router.param('teamId', validateTeamExists)
router.get('/:tournamentId/teams/:teamId',
  param('teamId').isMongoId().withMessage('El id no es valido'),  
  handleInputErrors,
  TeamController.getTeamById
)

router.put('/:tournamentId/teams/:teamId',
  param('teamId').isMongoId().withMessage('El id no es valido'),  
  body('nameTeam')
    .notEmpty().withMessage('El nombre del equipo es requerido'),
  body('nameCoach')
    .notEmpty().withMessage('El nombre del coach es requerido'),
  handleInputErrors,
  TeamController.updateTeam

)

router.delete('/:tournamentId/teams/:teamId',
  param('teamId').isMongoId().withMessage('El id no es valido'),  
  handleInputErrors,
  TeamController.deleteTeam
)

export default router;