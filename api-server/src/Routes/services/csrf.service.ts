/* Autor: Marvin Wiechers */
import { Request, Response, NextFunction } from 'express';

class CsrfService {
  manageCsrf = (req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
    }
    if (req.headers['x-perspl-csrf-protection']) {
      next();
    } else {
      res.status(403).json({ message: 'No correct csrf Header' });
    }
  };
}

export const csrfService = new CsrfService();
