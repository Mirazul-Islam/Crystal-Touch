import type { HandlerResponse } from '@netlify/functions';

const baseHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

export function json(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: baseHeaders,
    body: JSON.stringify(body),
  };
}

export function ok(body: unknown): HandlerResponse {
  return json(200, body);
}

export function created(body: unknown): HandlerResponse {
  return json(201, body);
}

export function badRequest(message: string, details?: unknown): HandlerResponse {
  return json(400, { error: message, details });
}

export function unauthorized(message = 'Unauthorized'): HandlerResponse {
  return json(401, { error: message });
}

export function forbidden(message = 'Forbidden'): HandlerResponse {
  return json(403, { error: message });
}

export function notFound(message = 'Not found'): HandlerResponse {
  return json(404, { error: message });
}

export function methodNotAllowed(): HandlerResponse {
  return json(405, { error: 'Method not allowed' });
}

export function serverError(message = 'Internal server error'): HandlerResponse {
  return json(500, { error: message });
}

export function preflight(): HandlerResponse {
  return { statusCode: 204, headers: baseHeaders, body: '' };
}

/** Thrown by guards to short-circuit a handler with a specific HTTP response. */
export class HttpError extends Error {
  response: HandlerResponse;
  constructor(response: HandlerResponse) {
    super('HttpError');
    this.response = response;
  }
}

export function parseBody<T>(body: string | null): T {
  if (!body) throw new HttpError(badRequest('Missing request body'));
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new HttpError(badRequest('Invalid JSON body'));
  }
}
