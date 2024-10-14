import type { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';
export class AuthController {

  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email, role } = req.body;
  
      // Prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error('El usuario ya está registrado');
        res.status(409).json({ error: error.message });
        return;
      }
  
      const user = new User({
        ...req.body,
        role: role || 'viewer'  // Asigna un rol o el rol predeterminado "viewer"
      });
  
      // Hash password
      user.password = await hashPassword(password);
  
      // Generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
  
      // Send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      });
  
      await Promise.allSettled([user.save(), token.save()]);
      res.send('Cuenta creada, revisa tu email para confirmar tu cuenta');
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
  

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
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('Usuario no encontrado');
        res.status(404).json({ error: error.message });
        return;
      }
  
      if (!user.confirmed) {
        // Generar token 
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        // Send email
        AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })
  
        const error = new Error('Usuario no confirmado, hemos enviado un email de confirmación');
        res.status(401).json({ error: error.message });
        return;
      }
  
      // Validar contraseña
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error('Contraseña incorrecta');
        res.status(401).json({ error: error.message });
        return;
      }
  
      const token = generateJWT({ id: user.id });
  
      res.send(token);
    } catch (error) {
     // console.error(error); // Log de error para ayudar a la depuración
      res.status(500).json({ error: 'Error en el servidor' });
      return
    }
  };
  
  

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

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const {email} = req.body

      //Usuario existe
      const user = await User.findOne({email})
      if(!user){
        const error = new Error('El usuario no está registrado');
        res.status(404).json({error: error.message});
        return 
      }

      // Generate token
      const token = new Token()
      token.token = generateToken()
      token.user = user.id
      await token.save()

      // Send email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token
      })

      res.send('Revisa tu email para ver las instrucciones');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});
    }
  }

  static validateToken = async (req: Request, res: Response) => {
    try {
      const {token} = req.body

      const tokenExists = await Token.findOne({token})
      if(!tokenExists){
        const error = new Error('Token no válido');
        res.status(404).json({error: error.message});
        return 
      }
      res.send('Token Valido, Define tu nuevo Password');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});
    }
  }

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const {token} = req.params

      const tokenExists = await Token.findOne({token})
      if(!tokenExists){
        const error = new Error('Token no válido');
        res.status(404).json({error: error.message});
        return 
      }
      const user = await User.findById(tokenExists.user)
      user.password = await hashPassword(req.body.password)

      await Promise.allSettled([user.save(), tokenExists.deleteOne()])
      res.send('El password ha sido actualizado');
    } catch (error) {
      res.status(500).json({error: 'Error en el servidor'});
    }
  }
    
  static user = async (req: Request, res: Response) => {
    const { _id, name, email, role } = req.user;
    res.json({ _id, name, email, role }); // Incluye el rol en la respuesta
    return
  };

  static changeUserRole = async (req: Request, res: Response) => {
    const { email, newRole } = req.body; // newRole debe ser 'admin' o 'viewer'
    try {
      // Verificar si el usuario autenticado es un admin
      if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'No autorizado para realizar esta acción' });
        return 
      }

      // Buscar al usuario por su email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return 
      }

      // Verificar que el nuevo rol sea válido
      if (!['admin', 'viewer'].includes(newRole)) {
        res.status(400).json({ error: 'Rol no válido' });
        return 
      }

      // Actualizar el rol
      user.role = newRole;
      await user.save();

      res.json({ message: `Rol actualizado a ${newRole} exitosamente` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar el rol' });
      return
    }
  };
}
