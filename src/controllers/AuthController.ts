import type { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
export class AuthController {

  static createAccount = async (req: Request, res: Response) => {
    try {
      const {password, email} = req.body

      //Prevenir duplicados
      const userExists = await User.findOne({email})
      if(userExists){
        const error = new Error('El usuario ya está registrado');
        res.status(409).json({error: error.message});
        return 
      }

      const user = new User(req.body);

      // Hash password
      user.password = await hashPassword(password);

      // Generate token
      const token = new Token()
      token.token = generateToken()
      token.user = user.id

      // Send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })

      await Promise.allSettled([user.save(), token.save()])
      res.send('Cuenta creada, revisa tu email para confirmar tu cuenta');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});
    }
  }

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const {token} = req.body

      const tokenExists = await Token.findOne({token})
      if(!tokenExists){
        const error = new Error('Token no válido');
        res.status(404).json({error: error.message});
        return 
      }

      const user = await User.findById(tokenExists.user)
      user.confirmed = true

      await Promise.allSettled([user.save(), tokenExists.deleteOne()])
      res.send('Cuenta confirmada');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});
    }
  }

  static login = async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body

      const user = await User.findOne({email})
      if(!user){
        const error = new Error('Usuario no encontrado');
        res.status(404).json({error: error.message});
        return 
      }

      if(!user.confirmed){
        const token = new Token()
        token.user = user.id
        token.token = generateToken()
        token.save()

      // Send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })

        const error = new Error('Usuario no confirmado, hemos enviado un email de confirmación');
        res.status(401).json({error: error.message});
        return 
      }

      // Validate password
      const isPasswordCorrect = await checkPassword(password, user.password)
      if(!isPasswordCorrect){
        const error = new Error('Contraseña incorrecta');
        res.status(401).json({error: error.message});
        return 
      }
      res.send('Usuario autenticado');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});

    }
  }

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const {email} = req.body

      //Usuario existe
      const user = await User.findOne({email})
      if(!user){
        const error = new Error('El usuario no está registrado');
        res.status(404).json({error: error.message});
        return 
      }

      if(user.confirmed){
        const error = new Error('El usuario ya está confirmado');
        res.status(403).json({error: error.message});
        return 
      }

      // Generate token
      const token = new Token()
      token.token = generateToken()
      token.user = user.id

      // Send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })

      await Promise.allSettled([user.save(), token.save()])
      res.send('Se envio un nuevo token, revisa tu email para confirmar tu cuenta');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});
    }
  }
    
}
