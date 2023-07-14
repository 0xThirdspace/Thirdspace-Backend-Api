import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
}

class CustomErrorClass extends Error implements CustomError {
  status?: number;

  constructor(message?: string, status?: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(error: CustomErrorClass, req: Request, res: Response, next: NextFunction) {
  res.status(error.status || 500);
  res.send({ error: true, message: error.message || 'Internal server error' });
}

export = errorHandler;
