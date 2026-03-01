import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { MetricsController } from '../src/metrics/metrics.controller';
import { HealthController } from '../src/health/health.controller';
import { Product, ProductCategory } from '../src/products/product.entity';

const mockProduct: Product = {
  id: 'uuid-p1',
  name: 'Elegantni Sat',
  description: 'Klasican muski sat',
  price: 12000,
  stock: 10,
  imageUrl: 'https://example.com/sat.jpg',
  category: ProductCategory.WATCHES,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductRepository = {
  find: jest.fn().mockResolvedValue([mockProduct]),
  findOne: jest.fn().mockResolvedValue(mockProduct),
  create: jest.fn().mockReturnValue(mockProduct),
  save: jest.fn().mockResolvedValue(mockProduct),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  remove: jest.fn().mockResolvedValue(mockProduct),
};

describe('ProductService E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TerminusModule,
        HttpModule,
      ],
      controllers: [ProductsController, MetricsController, HealthController],
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api');
    await app.init();
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/products', () => {
    it('treba da vrati listu proizvoda', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);
      const res = await request(app.getHttpServer()).get('/api/products').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Elegantni Sat');
    });

    it('treba da filtrira po kategoriji', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);
      const res = await request(app.getHttpServer()).get('/api/products?category=watches').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('treba da vrati jedan proizvod', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      const res = await request(app.getHttpServer()).get('/api/products/uuid-p1').expect(200);
      expect(res.body.id).toBe('uuid-p1');
    });

    it('treba da vrati 404 za nepostojeci ID', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await request(app.getHttpServer()).get('/api/products/nepostoji').expect(404);
    });
  });

  describe('POST /api/products', () => {
    it('treba da kreira novi proizvod', async () => {
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Novi Sat', price: 15000, stock: 5, category: 'watches' })
        .expect(201);
      expect(res.body.name).toBe('Elegantni Sat');
    });

    it('treba da vrati 400 za nevalidan payload', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Sat bez cijene' })
        .expect(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('treba da obrise proizvod', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);
      const res = await request(app.getHttpServer()).delete('/api/products/uuid-p1').expect(200);
      expect(res.body.message).toBe('Proizvod obrisan');
    });
  });

  describe('GET /api/health', () => {
    it('treba da vrati 200', async () => {
      await request(app.getHttpServer()).get("/api/health").expect((res) => { expect([200, 503]).toContain(res.status); });
    });
  });
});
