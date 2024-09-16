import { Request, Response } from "express";
import { encryptPassword, comparePasswords } from "../libs/bcrypt.util";
import { User, UserAddI, UserGetI } from "../models/user.model";
import jwt from "jsonwebtoken";
import config from "../config";
import nodemailer from "nodemailer"

export default class UserController {
  public static async createUser(req: Request, res: Response) {
    const { dni, name, lastName, password, email, phone } = req.body;
    try {
      // Verificar si ya existe un usuario activo
      const existingUser: UserGetI[] | null = await User.findAll({
        where: { email, active: true },
      });
      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Ya existe un usuario activo." });
      }

      // Encriptar la contraseña
      const passwordEncrypt = await encryptPassword(password);

      // Crear nuevo usuario
      const user: UserAddI = {
        dni,
        name,
        lastName,
        password: passwordEncrypt,
        email,
        phone,
      };
      const createdUser = await User.create(user);

      res
        .status(200)
        .json({
          success: true,
          message: "Usuario creado exitosamente.",
          user: {
            dni: createdUser.dni,
            name: createdUser.name,
            lastName: createdUser.lastName,
          },
        });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error interno del servidor al crear el usuario.",
          error,
        });
    }
  }

  public static async PreCreateUser(req: Request, res: Response) {
    const {email} = req.body;

    try {
      // Verificar si ya existe un usuario activo
      const existingUser: UserGetI[] | null = await User.findAll({
        where: { email, active: true },
      });
      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Ya existe un usuario activo." });
      }
      res.sendStatus(200);
    }catch (error) {
        console.error("Error al encontrar el usuario:", error);
        res
          .status(500)
          .json({
            success: false,
            message: "Error interno del servidor al enconrtar el usuario.",
            error,
          });
      }
  }


  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email , active: true} });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      // Comparar contraseñas
      const isPasswordValid = await comparePasswords(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Contraseña incorrecta" });
      }

      // Generar token JWT
     const token = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          lastname: user.lastName,
          email: user.email,
          phone: user.phone,
        },
        config.jwtSecret,
        { expiresIn: "1h" }
      );

      // Enviar el token al cliente
      res.status(200).json({ success: true, message: "Login exitoso", token });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor", error });
    }
  }
  public static async getProtectedData(req: Request, res: Response) {
    const user = req.user;
    res
      .status(200)
      .json({ authorized: true, message: "Acceso permitido", user });
  }

  //controlador que crea un codigo de 6 digitos de numero aleatorio y los envia al correo de la perosna y devuelve el codigo en la respuesta de la peticion

  public static async generateCode(req: Request, res: Response) {
    const { email } = req.body;
  
    try {
      const code = Math.floor(100000 + Math.random() * 900000);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email,
          pass: config.passwordEmail,
        },
      });
  
      const mailOptions = {
        from: config.email,
        to: email,
        subject: "Código de verificación",
        html: `
          <div style="background-color: #f8f9fd; padding: 20px; font-family: Arial, sans-serif; color: #0b0e14;">
            <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #ed500a; text-align: center;">¡Código de Verificación!</h2>
              <p style="font-size: 16px; line-height: 1.5;">
                ¡Hola! Gracias por registrarte. Para completar tu registro, por favor ingresa el siguiente código de verificación:
              </p>
              <div style="margin: 20px 0; padding: 10px; text-align: center; background-color: #0b0e14; color: #f8f9fd; font-size: 24px; border-radius: 5px;">
                <strong>${code}</strong>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">
                Si no solicitaste este código, por favor ignora este mensaje.
              </p>
              <p style="text-align: center; margin-top: 20px;">
                <small style="color: #888;">© 2024 Tu Empresa. Todos los derechos reservados.</small>
              </p>
            </div>
          </div>
        `,
      };
  
      // Usar la versión basada en promesas de sendMail con await
      await transporter.sendMail(mailOptions);
  
      return res.status(200).json({ success: true, message: "Código enviado", code });
    } catch (error) {
      console.error("Error al generar el código o enviar el correo:", error);
      return res.status(500).json({ success: false, message: "Error al generar el código o enviar el correo" });
    }
  }
  
}
