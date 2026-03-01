import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService, OrderCreatedEvent } from './notifications.service';

const mockEvent: OrderCreatedEvent = {
  orderId: 'uuid-1',
  customerEmail: 'kupac@example.com',
  customerName: 'Kupac Test',
  totalAmount: 12000,
  items: [{ name: 'Sat', quantity: 1, price: 12000 }],
  createdAt: new Date().toISOString(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('handleOrderCreated', () => {
    it('treba da sacuva notifikaciju', async () => {
      await service.handleOrderCreated(mockEvent);

      const all = service.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].orderId).toBe('uuid-1');
    });

    it('treba da sacuva vise notifikacija', async () => {
      await service.handleOrderCreated(mockEvent);
      await service.handleOrderCreated({ ...mockEvent, orderId: 'uuid-2' });

      expect(service.getAll()).toHaveLength(2);
    });
  });

  describe('getAll', () => {
    it('treba da vrati praznu listu inicijalno', () => {
      expect(service.getAll()).toHaveLength(0);
    });

    it('treba da vrati sve notifikacije', async () => {
      await service.handleOrderCreated(mockEvent);

      const result = service.getAll();
      expect(result[0].customerEmail).toBe('kupac@example.com');
      expect(result[0].totalAmount).toBe(12000);
    });
  });
});
