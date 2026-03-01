import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const gatewayRequestTotal = new client.Counter({
  name: 'api_gateway_requests_total',
  help: 'Total requests through API gateway',
  labelNames: ['method', 'service', 'status'],
  registers: [register],
});

export const gatewayRequestDuration = new client.Histogram({
  name: 'api_gateway_request_duration_seconds',
  help: 'Request duration through API gateway',
  labelNames: ['method', 'service'],
  registers: [register],
});

@Controller()
export class MetricsController {
  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
