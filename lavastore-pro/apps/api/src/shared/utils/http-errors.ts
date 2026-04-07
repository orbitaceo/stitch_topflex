/**
 * Tiny, zero-dependency HTTP error helper.
 * Compatible with Fastify — throws objects with statusCode + message.
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const httpErrors = {
  badRequest:   (msg: string)  => new HttpError(400, msg),
  unauthorized: (msg: string)  => new HttpError(401, msg),
  forbidden:    (msg: string)  => new HttpError(403, msg),
  notFound:     (msg: string)  => new HttpError(404, msg),
  conflict:     (msg: string)  => new HttpError(409, msg),
  tooMany:      (msg: string)  => new HttpError(429, msg),
  internal:     (msg: string)  => new HttpError(500, msg),
};
