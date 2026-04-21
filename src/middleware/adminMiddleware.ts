import { NextFunction, Request, Response } from 'express';

const adminOnly = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }

  next();
};

export default adminOnly;