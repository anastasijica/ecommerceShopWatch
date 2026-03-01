import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.ordersService.findByCustomer(customerId);
  }

  // SSE endpoint - reaktivna komunikacija
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.ordersService.getOrderEvents().pipe(
      map((order) => ({
        data: JSON.stringify(order),
        type: 'order-update',
      })),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
