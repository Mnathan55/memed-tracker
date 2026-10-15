import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// an error that carries an http status code
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // bad input caught by zod
  if (err instanceof ZodError) {
    const first = err.issues[0];
    res.status(400).json({ error: `${first.path.join('.')}: ${first.message}` });
    return;
  }

  // mongo duplicate key (for example same email twice)
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: 'Already exists' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}