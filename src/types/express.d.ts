import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // Define que puede ser un string o el tipo de JwtPayload
    }
  }
}
