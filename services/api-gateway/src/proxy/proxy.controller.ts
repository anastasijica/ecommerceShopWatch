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
    const targetBase = this.serviceMap[service];

    if (!targetBase) {
      throw new HttpException(
        `Servis '${service}' nije pronadjen`,
        HttpStatus.NOT_FOUND,
      );
    }

    const targetUrl = `${targetBase}${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    this.logger.log(`Proxy: ${req.method} ${req.path} → ${targetUrl}`);

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          method: req.method as any,
          url: targetUrl,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: req.body,
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization
              ? { Authorization: req.headers.authorization }
              : {}),
          },
          validateStatus: () => true,
        }),
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Proxy greska: ${(error as Error).message}`);
      throw new HttpException(
        'Servis nije dostupan',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
