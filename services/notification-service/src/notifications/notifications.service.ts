import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

export interface OrderCreatedEvent {
  orderId: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notifications: OrderCreatedEvent[] = [];

  @RabbitSubscribe({
    exchange: 'order.exchange',
    routingKey: 'order.created',
    queue: 'notifications.order.created',
  })
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log({
      message: 'Nova porudzbina primljena - saljemo notifikaciju',
      orderId: event.orderId,
      customerEmail: event.customerEmail,
      totalAmount: event.totalAmount,
    });

    // Cuvamo notifikaciju u memoriji (za demo)
    this.notifications.push(event);

    // Simulacija slanja emaila
    this.logger.log({
      message: `Email notifikacija poslana na ${event.customerEmail}`,
      subject: `Potvrda porudzbine #${event.orderId}`,
      totalAmount: event.totalAmount,
    });
  }

  getAll() {
    return this.notifications;
  }
}
