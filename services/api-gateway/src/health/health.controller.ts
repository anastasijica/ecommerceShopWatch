import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('user-service', `${this.config.get('USER_SERVICE_URL', 'http://localhost:3001')}/api/health`),
      () => this.http.pingCheck('product-service', `${this.config.get('PRODUCT_SERVICE_URL', 'http://localhost:3002')}/api/health`),
      () => this.http.pingCheck('order-service', `${this.config.get('ORDER_SERVICE_URL', 'http://localhost:3003')}/api/health`),
      () => this.http.pingCheck('notification-service', `${this.config.get('NOTIFICATION_SERVICE_URL', 'http://localhost:3004')}/api/health`),
    ]);
  }
}
