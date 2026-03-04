import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import {
  httpRequestDuration,
  httpRequestTotal,
} from './metrics/metrics.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();
    const traceHeader = req.headers['x-trace-id'];
    const traceId = Array.isArray(traceHeader)
      ? (traceHeader[0] ?? randomUUID())
      : (traceHeader ?? randomUUID());
    const route = req.path.replace(/\/[0-9a-fA-F-]{6,}/g, '/:id');

    req.headers['x-trace-id'] = traceId;
    res.setHeader('x-trace-id', traceId);
    res.on('finish', () => {
      const durationSeconds =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
      const labels = {
        method: req.method,
        route,
        status: String(res.statusCode),
      };

      httpRequestTotal.inc(labels);
      httpRequestDuration.observe(labels, durationSeconds);
      console.log(
        JSON.stringify({
          service: 'product-service',
          traceId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationSeconds: Number(durationSeconds.toFixed(6)),
        }),
      );
    });
    next();
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`product-service running on port ${port}`);
}
void bootstrap();
