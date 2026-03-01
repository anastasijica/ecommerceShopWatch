import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { MetricsController } from '../src/metrics/metrics.controller';
import { HealthController } from '../src/health/health.controller';
import { User, UserRole } from '../src/users/user.entity';

const mockUser: User = {
  id: 'uuid-e2e-1',
  email: 'e2e@example.com',
  passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWq',
  displayName: 'E2E Korisnik',
  role: UserRole.CUSTOMER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn().mockReturnValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
};

describe('UserService E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '7d' } }),
        TerminusModule,
        HttpModule,
      ],
      controllers: [AuthController, MetricsController, HealthController],
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);
  });

  describe('POST /api/auth/register', () => {
    it('treba da registruje korisnika i vrati token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'e2e@example.com', password: 'password123', displayName: 'E2E Korisnik' })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('e2e@example.com');
    });

    it('treba da vrati 400 za nevalidan email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'nije-email', password: 'pass123' })
        .expect(400);
    });

    it('treba da vrati 400 za kratku lozinku', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '123' })
        .expect(400);
    });

    it('treba da vrati 409 ako email vec postoji', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'e2e@example.com', password: 'password123' })
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('treba da vrati 401 za nepostojeci nalog', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nepostoji@example.com', password: 'password123' })
        .expect(401);
    });

    it('treba da vrati 400 za nevalidan payload', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nije-email' })
        .expect(400);
    });
  });

  describe('GET /api/health', () => {
    it('treba da vrati health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/api/health');
      expect([200, 503]).toContain(res.status);
      expect(res.body.status).toBeDefined();
    });
  });
});
