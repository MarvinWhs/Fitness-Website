/*Autor: Marvin Wiechers */
import { Request, Response, NextFunction } from 'express';

class CorsService {
  manageCors = (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.get('Origin');
    if (this.checkOrigin(requestOrigin)) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    if (this.isPreflightRequest(req)) {
      res.header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-PersPl-CSRF-PROTECTION');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
      } else {
        next();
      }
    } else {
      next();
    }
  };

  private isPreflightRequest = (req: Request): boolean => {
    const isOptionsMethod = req.method === 'OPTIONS';
    const hasOriginHeader = req.get('Origin') !== undefined;
    const hasAccessControlRequestMethod = req.get('Access-Control-Request-Method') !== undefined;

    return isOptionsMethod && hasOriginHeader && hasAccessControlRequestMethod;
  };

  private checkOrigin = (origin?: string): boolean => {
    return Boolean(origin);
  };
}

export const corsService = new CorsService();
