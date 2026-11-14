import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { Configuration, ErrorResponse } from '@nirvor/contracts';

export interface SafeEvent {
  event: string;
  requestId: string;
  method: string;
  status: number;
  durationMs: number;
}
export type EventSink = (event: SafeEvent) => void;

export function sendError(response: Response, status: number, code: string, message: string): void {
  if (response.headersSent) return;
  const payload: ErrorResponse = {
    error: { code, message, requestId: String(response.locals.requestId) },
  };
  response.status(status).json(payload);
}

export class WindowLimiter {
  private readonly entries = new Map<string, { count: number; until: number }>();
  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 10000,
  ) {}
  allow(key: string, now = Date.now()): boolean {
    let entry = this.entries.get(key);
    if (!entry || entry.until <= now) {
      if (this.entries.size >= this.maxKeys) {
        for (const [storedKey, value] of this.entries)
          if (value.until <= now) this.entries.delete(storedKey);
      }
      if (!this.entries.has(key) && this.entries.size >= this.maxKeys) return false;
      entry = { count: 0, until: now + this.windowMs };
      this.entries.set(key, entry);
    }
    entry.count++;
    return entry.count <= this.limit;
  }
}

export function requestControls(config: Configuration, sink: EventSink) {
  const limiter = new WindowLimiter(config.API_RATE_LIMIT, config.API_RATE_WINDOW_MS);
  let inflight = 0;
  return (request: Request, response: Response, next: NextFunction): void => {
    const start = performance.now();
    // Generate correlation server-side; never reflect arbitrary header values.
    const requestId = randomUUID();
    response.locals.requestId = requestId;
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('Cache-Control', 'no-store');
    let logged = false;
    const record = () => {
      if (logged) return;
      logged = true;
      sink({
        event: 'http.request',
        requestId,
        method: request.method,
        status: response.statusCode,
        durationMs: Math.round(performance.now() - start),
      });
    };
    response.once('finish', record);
    response.once('close', record);
    // No proxy headers are trusted. Distributed limits are a later topology decision.
    if (!limiter.allow(request.socket.remoteAddress ?? 'unknown')) {
      response.setHeader('Retry-After', Math.ceil(config.API_RATE_WINDOW_MS / 1000));
      sendError(response, 429, 'RATE_LIMITED', 'Too many requests. Try again later.');
      return;
    }
    if (inflight >= config.API_MAX_INFLIGHT) {
      sendError(response, 503, 'OVERLOADED', 'Service is busy. Try again later.');
      return;
    }
    inflight++;
    const timer = setTimeout(
      () => sendError(response, 504, 'REQUEST_TIMEOUT', 'Request timed out.'),
      config.API_REQUEST_TIMEOUT_MS,
    );
    timer.unref();
    response.once('close', () => {
      inflight--;
      clearTimeout(timer);
    });
    next();
  };
}
