import { Request, Response } from "express";
import { encryptPassword, comparePasswords } from "../libs/bcrypt.util";
import { User, UserAddI, UserGetI } from "../models/user.model";
import jwt from "jsonwebtoken";
import config from "../config";
import { RefreshToken } from "../models/RefreshToken.model";

export default class UserController {
  // Crear usuario
  public static async createUser(req: Request, res: Response) {
    const { dni, name, lastName, password, email, phone } = req.body;
    try {
      // Verificar si ya existe un usuario activo
      const existingUser: UserGetI[] | null = await User.findAll({
        where: { active: true },
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

      res.status(200).json({
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
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al crear el usuario.",
        error,
      });
    }
  }

  // Login del usuario
  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email, active: true } });

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

  // Obtener datos protegidos
  public static async getProtectedData(req: Request, res: Response) {
    const user = req.user;
    res
      .status(200)
      .json({ authorized: true, message: "Acceso permitido", user });
  }

  // Logout del usuario
  public static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ success: false, message: "No se envió el refresh token" });
      }

      // Buscar el refresh token en la base de datos
      const tokenInDb = await RefreshToken.findOne({ where: { token: refreshToken } });

      if (!tokenInDb) {
        return res.status(400).json({ success: false, message: "Refresh token no válido" });
      }

      // Eliminar el refresh token de la base de datos
      await RefreshToken.destroy({ where: { token: refreshToken } });

      // Responder que el usuario ha sido deslogueado exitosamente
      res.status(200).json({ success: true, message: "Logout exitoso, token eliminado" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor", error });
    }
  }

  public static async refreshAuthToken (req: Request, res: Response) {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token es requerido" });
    }
  
    try {
      const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });
  
      if (!tokenRecord) {
        return res.status(403).json({ success: false, message: "Refresh token inválido" });
      }
  
      // Verificar si el refresh token ha expirado
      if (tokenRecord.expiresAt < new Date()) {
        return res.status(403).json({ success: false, message: "Refresh token ha expirado" });
      }
  
      const user = await User.findByPk(tokenRecord.userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
  
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
        config.jwtSecret,
        { expiresIn: "1h" } 
      );
  
      // Renovar el refresh token
      const newRefreshToken = jwt.sign({}, config.jwtSecret, { expiresIn: "7d" });
      tokenRecord.token = newRefreshToken;
      tokenRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días de expiración
      await tokenRecord.save();
  
      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Error al renovar el token:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor", error });
    }
  };
}
