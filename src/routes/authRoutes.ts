import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post('/create-account', 
  body('name')
    .notEmpty().withMessage('El nombre de usuario es obligatorio'),
  body('email')
    .isEmail().withMessage('El email no es válido'),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('password_confirmation').custom((value, {req})=>{
    if(value !== req.body.password){
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.createAccount
);

router.post('/confirm-account',
  body('token')
    .notEmpty().withMessage('El token es obligatorio'),
  handleInputErrors,
  AuthController.confirmAccount
)

router.post('/login',
  body('email')
    .isEmail().withMessage('El email no es válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
  handleInputErrors,
  AuthController.login
)

router.post('/request-code',
  body('email')
    .isEmail().withMessage('El email no es válido'),
  handleInputErrors,
  AuthController.requestConfirmationCode
)

router.post('/forgot-password',
  body('email')
    .isEmail().withMessage('El email no es válido'),
  handleInputErrors,
  AuthController.forgotPassword
)

router.post('/validate-token',
  body('token')
    .notEmpty().withMessage('El token es obligatorio'),
  handleInputErrors,
  AuthController.validateToken
)

router.post('/update-password/:token',
  param('token').isNumeric().withMessage('El token no es válido'),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('password_confirmation').custom((value, {req})=>{
    if(value !== req.body.password){
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
)

router.get('/user',
  authenticate,
  AuthController.user
)

// Ruta para cambiar el rol de usuario
router.post('/change-role', 
  authenticate, 
  AuthController.changeUserRole
)

// Profile
router.put('/profile',
  authenticate,
  body('name')
    .notEmpty().withMessage('El nombre de usuario es obligatorio'),
  body('email')
    .isEmail().withMessage('El email no es válido'),
  handleInputErrors,
  AuthController.updateProfile
)

router.post('/update-password',
  authenticate,
  body('old_password')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('password_confirmation').custom((value, {req})=>{
    if(value !== req.body.password){
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
)



export default router;