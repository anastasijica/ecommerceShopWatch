import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';

const mockOrder: Order = {
  id: 'uuid-1',
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
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockAmqpConnection = {
  publish: jest.fn().mockResolvedValue(undefined),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: AmqpConnection, useValue: mockAmqpConnection },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('treba da vrati sve porudzbine', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].customerEmail).toBe('kupac@example.com');
    });
  });

  describe('findByCustomer', () => {
    it('treba da vrati porudzbine za odredjenog kupca', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      await service.findByCustomer('user-1');

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { customerId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('treba da vrati porudzbinu po ID-u', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('uuid-1');

      expect(result.id).toBe('uuid-1');
    });

    it('treba da baci NotFoundException ako porudzbina ne postoji', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nepostoji')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('treba da kreira porudzbinu i publishuje RabbitMQ event', async () => {
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create({
        items: [{ productId: 'p1', name: 'Sat', price: 12000, quantity: 1 }],
        totalAmount: 12000,
        customerId: 'user-1',
        customerEmail: 'kupac@example.com',
      });

      expect(result.id).toBe('uuid-1');
      expect(mockAmqpConnection.publish).toHaveBeenCalledWith(
        'order.exchange',
        'order.created',
        expect.objectContaining({ orderId: 'uuid-1' }),
      );
    });
  });

  describe('updateStatus', () => {
    it('treba da azurira status porudzbine', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateStatus('uuid-1', OrderStatus.PROCESSING);

      expect(mockOrderRepository.update).toHaveBeenCalledWith('uuid-1', {
        status: OrderStatus.PROCESSING,
      });
    });
  });
});
