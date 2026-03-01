import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  displayName: 'Test User',
  role: UserRole.CUSTOMER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('treba da registruje novog korisnika', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('treba da baci ConflictException ako email postoji', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', password: 'pass123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('treba da vrati token za ispravne kredencijale', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, passwordHash: hashed });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('treba da baci UnauthorizedException za pogresnu lozinku', async () => {
      // passwordHash ne odgovara - bcrypt.compare ce vratiti false
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, passwordHash: 'wrong_hash' });

      await expect(
        service.login({ email: 'test@example.com', password: 'pogresna_lozinka' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('treba da baci UnauthorizedException ako korisnik ne postoji', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nepostoji@example.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('treba da vrati korisnika bez passwordHash', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-1');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('treba da vrati null ako korisnik ne postoji', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nepostoji');
      expect(result).toBeNull();
    });
  });
});
