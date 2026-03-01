import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const notificationsTotal = new client.Counter({
  name: 'notification_service_notifications_total',
  help: 'Total notifications processed',
  labelNames: ['type'],
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
