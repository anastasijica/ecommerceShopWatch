import {
  Controller,
  All,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  gatewayRequestDuration,
  gatewayRequestTotal,
} from '../metrics/metrics.controller';
import { randomUUID } from 'crypto';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);
  private readonly serviceMap: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.serviceMap = {
      auth: config.get('USER_SERVICE_URL', 'http://localhost:3001'),
      users: config.get('USER_SERVICE_URL', 'http://localhost:3001'),
      products: config.get('PRODUCT_SERVICE_URL', 'http://localhost:3002'),
      orders: config.get('ORDER_SERVICE_URL', 'http://localhost:3003'),
      notifications: config.get(
        'NOTIFICATION_SERVICE_URL',
        'http://localhost:3004',
      ),
    };
  }

  @All('api/:service/(.*)')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const params = req.params as Record<string, string>;
    const service = params['service'];
    const startedAt = process.hrtime.bigint();
    const traceHeader = req.headers['x-trace-id'];
    const traceId = Array.isArray(traceHeader)
      ? (traceHeader[0] ?? randomUUID())
      : (traceHeader ?? randomUUID());
    res.setHeader('x-trace-id', traceId);

    const targetBase = this.serviceMap[service];
    const metricService = service || 'unknown';

    if (!targetBase) {
      const durationSeconds =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
      gatewayRequestTotal.inc({
        method: req.method,
        service: metricService,
        status: '404',
      });
      gatewayRequestDuration.observe(
        { method: req.method, service: metricService },
        durationSeconds,
      );
      throw new HttpException(
        `Servis '${service}' nije pronadjen`,
        HttpStatus.NOT_FOUND,
      );
    }

    const targetUrl = `${targetBase}${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    this.logger.log(`Proxy: ${req.method} ${req.path} → ${targetUrl}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-trace-id': traceId,
      };
      const authHeader = req.headers.authorization;
      if (typeof authHeader === 'string') {
        headers.Authorization = authHeader;
      }

      const response = await firstValueFrom(
        this.httpService.request({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          method: req.method as any,
          url: targetUrl,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: req.body,
          headers,
          validateStatus: () => true,
        }),
      );

      const durationSeconds =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
      gatewayRequestTotal.inc({
        method: req.method,
        service: metricService,
        status: String(response.status),
      });
      gatewayRequestDuration.observe(
        { method: req.method, service: metricService },
        durationSeconds,
      );
      this.logger.log(
        JSON.stringify({
          traceId,
          method: req.method,
          service: metricService,
          statusCode: response.status,
          durationSeconds: Number(durationSeconds.toFixed(6)),
        }),
      );
      res.status(response.status).json(response.data);
    } catch (error) {
      const durationSeconds =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
      gatewayRequestTotal.inc({
        method: req.method,
        service: metricService,
        status: '503',
      });
      gatewayRequestDuration.observe(
        { method: req.method, service: metricService },
        durationSeconds,
      );
      this.logger.error(
        `Proxy greska traceId=${traceId}: ${(error as Error).message}`,
      );
      throw new HttpException(
        'Servis nije dostupan',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
