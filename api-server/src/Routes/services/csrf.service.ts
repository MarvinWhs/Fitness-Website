import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

class CsrfService {
  private tokenLength: number = 32;
  private tokenHeaderName: string = 'x-csrf-token';
  private tokenCookieName: string = 'csrf-token';

  constructor() {
    this.setToken = this.setToken.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.getCsrfToken = this.getCsrfToken.bind(this);
  }

  generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  setToken(req: Request, res: Response) {
    const token = this.generateToken();
    res.cookie(this.tokenCookieName, token, { httpOnly: true, secure: true, sameSite: 'lax' });
    return token;
  }

  validateToken(req: Request, res: Response, next: NextFunction) {
    const tokenFromHeader = req.headers[this.tokenHeaderName];
    const tokenFromCookie = req.cookies[this.tokenCookieName];

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    if (tokenFromHeader && tokenFromHeader === tokenFromCookie) {
      next();
    } else {
      res.status(403).json({ message: 'Invalid CSRF token' });
    }
  }

  getCsrfToken(req: Request, res: Response) {
    const token = this.setToken(req, res);
    res.json({ csrfToken: token });
  }
}

export const csrfService = new CsrfService();
