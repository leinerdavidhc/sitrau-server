import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UserValidator } from "../validations/user.validations";
import jwt from 'jsonwebtoken';
import config from "../config";

export default class UserMiddleware {

  static async validateRegister(req: Request, res: Response, next: NextFunction) {
    try {
      // Intentar validar los datos
     const { valid, errors } = UserValidator.validateRegister(req.body);
      if (!valid) {
        return res.status(400).json({ success: false, errors });
      }
      if (req.body.password!=req.body.confirmPassword) {
        return res.status(400).json({ success: false, error: "Las contraseñas no coinciden" });
      }
      next();
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Si es un ZodError, extraer los detalles
        return res.status(400).json({
          errors: error.errors.map(err => ({
            path: err.path[0] || 'unknown', 
            message: err.message
          }))
        });
      }
      // Manejar otros tipos de errores si es necesario
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }

  public static validateLogin(req: any, res: any, next: any) {
    try {
      const { valid, errors } = UserValidator.validateLogin(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Si es un ZodError, extraer los detalles
        return res.status(400).json({
          errors: error.errors.map(err => ({
            path: err.path[0] || 'unknown', 
            message: err.message
          }))
        });
        
      }
    }
  }

  public static authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (token == null) return res.status(401).json({ message: "No token provided",authorized:false });
  
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token',authorized:false });
      }
      req.user = user;
      next();
    });
  }
  
}
