import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

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
  app.use((req: Request, res: Response, next: NextFunction) => {
    const traceHeader = req.headers['x-trace-id'];
    const traceId = Array.isArray(traceHeader)
      ? (traceHeader[0] ?? randomUUID())
      : (traceHeader ?? randomUUID());

    req.headers['x-trace-id'] = traceId;
    res.setHeader('x-trace-id', traceId);
    next();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`api-gateway running on port ${port}`);
}
void bootstrap();
