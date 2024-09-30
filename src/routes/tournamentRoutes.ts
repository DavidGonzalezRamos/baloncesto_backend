import {Router} from 'express';
import {body, param} from 'express-validator'
import { TournamentController } from '../controllers/TournamentController';
import { handleInputErrors } from '../middleware/validation';

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


export default router;