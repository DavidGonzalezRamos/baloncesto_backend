import { transporter } from "../config/nodemailer"

interface IEmail {
  email: string
  name: string
  token: string
}


export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
     // Send email
     const info = await transporter.sendMail({
      from: 'Baloncesto <admin@baloncesto.com>',
      to: user.email,
      subject: 'Confirma tu cuenta',
      text: 'Baloncesto IPN - Confirma tu cuenta',
      html: `
        <h1>Bienvenido a Baloncesto IPN</h1>
        <p>Hola mi estimado: ${user.name}, has creado tu cuenta, solo confirma tu cuenta</p>
        <p>Para confirmar tu cuenta, da click en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
        <p>E ingresando el siguiente codigo: <b>${user.token}</b></p>
        <p>Este codigo expirará en 10 minutos</p>
        `

    })

    console.log('Email enviado', info.messageId)
  }


  static sendPasswordResetToken = async (user: IEmail) => {
    // Send email
    const info = await transporter.sendMail({
     from: 'Baloncesto <admin@baloncesto.com>',
     to: user.email,
     subject: 'Reestable tu contraseña',
     text: 'Baloncesto IPN - Reestablece tu contraseña',
     html: `
       <h1>Bienvenido a Baloncesto IPN</h1>
       <p>Hola mi estimado: ${user.name}, has solicitado reestablecer tu password</p>
       <p>Para confirmar tu cuenta, da click en el siguiente enlace:</p>
       <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
       <p>E ingresando el siguiente codigo: <b>${user.token}</b></p>
       <p>Este codigo expirará en 10 minutos</p>
       `

   })

   console.log('Email enviado', info.messageId)
 }
}