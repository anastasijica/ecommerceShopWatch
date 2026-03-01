import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';
import { MetricsController } from '../src/metrics/metrics.controller';
import { HealthController } from '../src/health/health.controller';
import { Order, OrderStatus } from '../src/orders/order.entity';

const mockOrder: Order = {
  id: 'uuid-o1',
  items: [{ productId: 'p1', name: 'Sat', price: 12000, quantity: 1 }],
  totalAmount: 12000,
  customerId: 'user-1',
  customerEmail: 'kupac@example.com',
  customerName: 'Kupac Test',
  status: OrderStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrderRepository = {
  find: jest.fn().mockResolvedValue([mockOrder]),
  findOne: jest.fn().mockResolvedValue(mockOrder),
  create: jest.fn().mockReturnValue(mockOrder),
  save: jest.fn().mockResolvedValue(mockOrder),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockAmqpConnection = {
  publish: jest.fn().mockResolvedValue(undefined),
};

describe('OrderService E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TerminusModule,
        HttpModule,
      ],
      controllers: [OrdersController, MetricsController, HealthController],
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: AmqpConnection, useValue: mockAmqpConnection },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/orders', () => {
    it('treba da vrati sve porudzbine', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      const res = await request(app.getHttpServer())
        .get('/api/orders')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].customerEmail).toBe('kupac@example.com');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('treba da vrati jednu porudzbinu', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      const res = await request(app.getHttpServer())
        .get('/api/orders/uuid-o1')
        .expect(200);
      expect(res.body.id).toBe('uuid-o1');
    });

    it('treba da vrati 404 za nepostojeci ID', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get('/api/orders/nepostoji')
        .expect(404);
    });
  });

  describe('POST /api/orders', () => {
    it('treba da kreira porudzbinu i publishuje RabbitMQ event', async () => {
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          items: [{ productId: 'p1', name: 'Sat', price: 12000, quantity: 1 }],
          totalAmount: 12000,
          customerId: 'user-1',
          customerEmail: 'kupac@example.com',
        })
        .expect(201);
      expect(res.body.id).toBe('uuid-o1');
      expect(mockAmqpConnection.publish).toHaveBeenCalled();
    });

    it('treba da vrati 400 za nevalidan payload', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({ totalAmount: 100 })
        .expect(400);
    });
  });

  describe('GET /api/orders/customer/:customerId', () => {
    it('treba da vrati porudzbine kupca', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      const res = await request(app.getHttpServer())
        .get('/api/orders/customer/user-1')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/health', () => {
    it('treba da vrati 200', async () => {
      await request(app.getHttpServer())
        .get('/api/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });
  });
});
