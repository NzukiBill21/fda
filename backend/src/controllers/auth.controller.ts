import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phone, password, name } = req.body;
      const result = await AuthService.register({ email, phone, password, name });
      
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      res.json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await AuthService.logout(token);
      }
      
      res.json({
        status: 'success',
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}

