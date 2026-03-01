import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { NotificationsController } from '../src/notifications/notifications.controller';
import { NotificationsService } from '../src/notifications/notifications.service';
import { MetricsController } from '../src/metrics/metrics.controller';
import { HealthController } from '../src/health/health.controller';

const mockNotificationsService = {
  handleOrderCreated: jest.fn().mockResolvedValue(undefined),
  getAll: jest.fn().mockReturnValue([
    {
      orderId: 'uuid-1',
      customerEmail: 'kupac@example.com',
      customerName: 'Kupac Test',
      totalAmount: 12000,
      items: [{ name: 'Sat', quantity: 1, price: 12000 }],
      createdAt: new Date().toISOString(),
    },
  ]),
};

describe('NotificationService E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TerminusModule,
      ],
      controllers: [NotificationsController, MetricsController, HealthController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/notifications', () => {
    it('treba da vrati listu notifikacija', async () => {
      const res = await request(app.getHttpServer()).get('/api/notifications').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].orderId).toBe('uuid-1');
    });

    it('treba da vrati notifikacije sa ispravnim podacima', async () => {
      const res = await request(app.getHttpServer()).get('/api/notifications').expect(200);
      expect(res.body[0].customerEmail).toBe('kupac@example.com');
      expect(res.body[0].totalAmount).toBe(12000);
    });
  });

  describe('GET /api/health', () => {
    it('treba da vrati 200', async () => {
      await request(app.getHttpServer()).get('/api/health').expect(200);
    });
  });
});
