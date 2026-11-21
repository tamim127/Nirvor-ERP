import 'reflect-metadata';
import {
  Catch,
  BadRequestException,
  ForbiddenException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpCode,
  Inject,
  Injectable,
  Module,
  Post,
  Req,
  Res,
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
import type { Request, Response } from 'express';
import helmet from 'helmet';
import {
  loginRequestSchema,
  sessionTokenSchema,
  tenantIdSchema,
  type AuthorizedRequestContext,
  type Configuration,
  type HealthResponse,
} from '@nirvor/contracts';
import { requestControls, sendError, type EventSink } from './controls.js';

const publicKey = 'nirvor.public';
const scopedSessionKey = 'nirvor.scopedSession';
const probeToken = Symbol('database.probe');
const authToken = Symbol('authentication.port');
export const PublicEndpoint = () => SetMetadata(publicKey, true);

export interface AuthPort {
  authenticate(email: string, password: string): Promise<{ userId: string } | null>;
  createSession(userId: string): Promise<{ token: string; expiresAt: Date }>;
  resolveSession(token: string): Promise<{ userId: string; tenantIds: string[] } | null>;
  resolveContext(
    token: string,
    tenantId: string,
    branchId: string,
  ): Promise<{ userId: string; tenantId: string; branchId: string } | null>;
  revokeSession(token: string): Promise<boolean>;
}

type AuthenticatedRequest = Request & { auth?: AuthorizedRequestContext };

function sessionCookie(request: Request): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  for (const item of header.split(';')) {
    const [name, ...value] = item.trim().split('=');
    if (name === 'nirvor_session') return value.join('=') || undefined;
  }
  return undefined;
}

function setSessionCookie(response: Response, token: string, maxAge: number): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `nirvor_session=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Strict${secure}`,
  );
}

@Injectable()
class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(authToken) private readonly auth: AuthPort | undefined,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(publicKey, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    if (!this.auth) throw new UnauthorizedException();
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = sessionCookie(request);
    if (!token || !sessionTokenSchema.safeParse(token).success) throw new UnauthorizedException();
    const session = await this.auth.resolveSession(token);
    if (!session) throw new UnauthorizedException();
    // Authentication alone never grants access to an unspecified business action.
    // Only the session inspection handler opts into this narrow policy.
    if (!this.reflector.get<boolean>(scopedSessionKey, context.getHandler()))
      throw new ForbiddenException();
    const requestedTenant = request.headers['x-tenant-id'];
    const requestedValue = Array.isArray(requestedTenant) ? requestedTenant[0] : requestedTenant;
    const tenantId =
      requestedValue ?? (session.tenantIds.length === 1 ? session.tenantIds[0] : undefined);
    if (!tenantId || !tenantIdSchema.safeParse(tenantId).success)
      throw new BadRequestException('An active workspace is required.');
    if (!session.tenantIds.includes(tenantId)) throw new UnauthorizedException();
    const requestedBranch = request.headers['x-branch-id'];
    const branchId = Array.isArray(requestedBranch) ? requestedBranch[0] : requestedBranch;
    if (!branchId || !tenantIdSchema.safeParse(branchId).success)
      throw new BadRequestException('An active branch is required.');
    const authorized = await this.auth.resolveContext(token, tenantId, branchId);
    if (!authorized) throw new UnauthorizedException();
    request.auth = { ...authorized, permissions: new Set() };
    return true;
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

@Controller('auth')
class AuthController {
  constructor(@Inject(authToken) private readonly auth: AuthPort | undefined) {}

  @Post('login')
  @HttpCode(200)
  @PublicEndpoint()
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    if (!this.auth) throw new ServiceUnavailableException();
    const parsed = loginRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException();
    const identity = await this.auth.authenticate(parsed.data.email, parsed.data.password);
    if (!identity) throw new UnauthorizedException();
    const session = await this.auth.createSession(identity.userId);
    setSessionCookie(response, session.token, 8 * 60 * 60);
    return { authenticated: true };
  }

  @Post('logout')
  @HttpCode(200)
  @PublicEndpoint()
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = sessionCookie(request);
    if (token && this.auth) await this.auth.revokeSession(token);
    setSessionCookie(response, '', 0);
    return { authenticated: false };
  }

  @Get('session')
  @SetMetadata(scopedSessionKey, true)
  session(@Req() request: AuthenticatedRequest) {
    if (!request.auth) throw new UnauthorizedException();
    return { userId: request.auth.userId, tenantIds: [request.auth.tenantId] };
  }
}

export async function createApp(
  config: Configuration,
  probe: () => Promise<void>,
  sink: EventSink = (event) => console.log(JSON.stringify(event)),
  additionalControllers: Type[] = [],
  auth?: AuthPort,
): Promise<NestExpressApplication> {
  @Module({
    controllers: [HealthController, AuthController, ...additionalControllers],
    providers: [
      { provide: probeToken, useValue: probe },
      { provide: authToken, useValue: auth },
    ],
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
  app.useGlobalGuards(new AuthenticationGuard(app.get(Reflector), auth));
  app.useGlobalFilters(new SafeErrorFilter());
  const server = app.getHttpServer() as import('node:http').Server;
  server.headersTimeout = 10000;
  server.requestTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 1000;
  await app.init();
  return app;
}
