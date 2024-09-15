import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { SuperUserValidator } from '../validations/superUser.validations';
import jwt from 'jsonwebtoken';
import config from "../config";
export default class SuperUserMiddleware {
  static async validateLogin(req: Request, res: Response, next: NextFunction) {
    try {
      // Intentar validar los datos
      const {valid,errors}=SuperUserValidator.validateLogin(req.body);

      if (!valid) {
        return res.status(400).json({ success: false, errors });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Si es un ZodError, extraer los detalles
        return res.status(400).json({
          errors: error.errors.map(err => ({
            path: err.path[0] || 'unknown', // Campo que produjo el error
            message: err.message // Mensaje de error
          }))
        });
      }
      // Manejar otros tipos de errores si es necesario
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }

  static async validateRegister(req: Request, res: Response, next: NextFunction) {
    try {
      // Intentar validar los datos
     const {valid,errors}= SuperUserValidator.validateRegister(req.body);
     if (!valid) {
        return res.status(400).json({ success: false, errors });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Si es un ZodError, extraer los detalles
        return res.status(400).json({
          errors: error.errors.map(err => ({
            path: err.path[0] || 'unknown', // Campo que produjo el error
            message: err.message // Mensaje de error
          }))
        });
      }
      // Manejar otros tipos de errores si es necesario
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }

  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.access_token;
    
    if (!token) return res.status(401).json({ message: "No token provided",authorized:false })

    try {
        const decoded=jwt.verify(token,  config.jwtSecret)
        req.user = decoded
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
}
