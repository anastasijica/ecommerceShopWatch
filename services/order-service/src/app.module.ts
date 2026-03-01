import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { Order } from './orders/order.entity';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { MetricsController } from './metrics/metrics.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'orders_db'),
        entities: [Order],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Order]),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        exchanges: [{ name: 'order.exchange', type: 'topic' }],
        uri: config.get<string>(
          'RABBITMQ_URI',
          'amqp://guest:guest@localhost:5672',
        ),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    HttpModule,
  ],
  controllers: [OrdersController, MetricsController, HealthController],
  providers: [OrdersService],
})
export class AppModule {}
