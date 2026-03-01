import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TerminusModule } from '@nestjs/terminus';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { MetricsController } from './metrics/metrics.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        exchanges: [{ name: 'order.exchange', type: 'topic' }],
        uri: config.get('RABBITMQ_URI', 'amqp://guest:guest@localhost:5672'),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
  ],
  controllers: [NotificationsController, MetricsController, HealthController],
  providers: [NotificationsService],
})
export class AppModule {}
