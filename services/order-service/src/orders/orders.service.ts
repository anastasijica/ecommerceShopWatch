import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  // SSE - reaktivna komunikacija
  private readonly orderEvents$ = new Subject<Order>();

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  getOrderEvents() {
    return this.orderEvents$.asObservable();
  }

  findAll() {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  findByCustomer(customerId: string) {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Porudzbina ${id} nije pronadjena`);
    return order;
  }

  async create(dto: CreateOrderDto, traceId?: string) {
    const order = this.orderRepository.create(dto);
    const saved = await this.orderRepository.save(order);

    // Publish async event ka RabbitMQ
    await this.amqpConnection.publish('order.exchange', 'order.created', {
      orderId: saved.id,
      customerEmail: saved.customerEmail,
      customerName: saved.customerName,
      totalAmount: saved.totalAmount,
      items: saved.items,
      createdAt: saved.createdAt,
      traceId,
    });

    // Emituj SSE event
    this.orderEvents$.next(saved);

    return saved;
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);
    await this.orderRepository.update(id, { status });
    const updated = await this.findOne(id);

    // SSE notification o promeni statusa
    this.orderEvents$.next(updated);

    return updated;
  }
}
