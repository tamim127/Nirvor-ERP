import 'reflect-metadata';
import {
  Catch,
  Controller,
  Get,
  HttpException,
  Inject,
  Injectable,
  Module,
  ServiceUnavailableException,
  SetMetadata,
  UnauthorizedException,
  type ArgumentsHost,
  type CanActivate,
  type ExecutionContext,
  type ExceptionFilter,
  type Type,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Response } from 'express';
import helmet from 'helmet';
import type { Configuration, HealthResponse } from '@nirvor/contracts';
import { requestControls, sendError, type EventSink } from './controls.js';

const publicKey = 'nirvor.public';
const probeToken = Symbol('database.probe');
export const PublicEndpoint = () => SetMetadata(publicKey, true);

@Injectable()
class DenyByDefaultGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    if (
      this.reflector.getAllAndOverride<boolean>(publicKey, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    // No provisional authentication or client-supplied role is accepted in Phase 1.
    throw new UnauthorizedException();
  }
}

@Catch()
class SafeErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const known: Record<number, [string, string]> = {
      400: ['INVALID_REQUEST', 'Request is invalid.'],
      401: ['AUTHENTICATION_REQUIRED', 'Authentication is required.'],
      403: ['FORBIDDEN', 'You do not have access to this action.'],
      404: ['NOT_FOUND', 'Resource not found.'],
      413: ['PAYLOAD_TOO_LARGE', 'Request payload is too large.'],
      503: ['UNAVAILABLE', 'Service is not ready.'],
    };
    const [code, message] = known[status] ?? ['INTERNAL_ERROR', 'An unexpected error occurred.'];
    sendError(response, status, code, message);
  }
}

@Controller('health')
class HealthController {
  constructor(@Inject(probeToken) private readonly probe: () => Promise<void>) {}
  @Get('live')
  @PublicEndpoint()
  live(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('ready')
  @PublicEndpoint()
  async ready(): Promise<HealthResponse> {
    try {
      await this.probe();
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException();
    }
  }
}

export async function createApp(
  config: Configuration,
  probe: () => Promise<void>,
  sink: EventSink = (event) => console.log(JSON.stringify(event)),
  additionalControllers: Type[] = [],
): Promise<NestExpressApplication> {
  @Module({
    controllers: [HealthController, ...additionalControllers],
    providers: [{ provide: probeToken, useValue: probe }],
  })
  class FoundationModule {}
  const app = await NestFactory.create<NestExpressApplication>(FoundationModule, {
    logger: false,
    bodyParser: false,
  });
  app.disable('x-powered-by');
  app.set('trust proxy', false);
  app.use(helmet());
  app.use(requestControls(config, sink));
  app.useBodyParser('json', { limit: '16kb', strict: true });
  app.useGlobalGuards(new DenyByDefaultGuard(app.get(Reflector)));
  app.useGlobalFilters(new SafeErrorFilter());
  const server = app.getHttpServer() as import('node:http').Server;
  server.headersTimeout = 10000;
  server.requestTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 1000;
  await app.init();
  return app;
}
