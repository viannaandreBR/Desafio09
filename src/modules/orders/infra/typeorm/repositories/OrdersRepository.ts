import { OrdersRepository } from '@modules/orders/infra/typeorm/repositories/OrdersRepository';
import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  // --------------------- Método Create

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    // TODO

    const order = this.ormRepository.create({
      customer,
      order_products: products,
    });

    await this.ormRepository.save(order);

    return order;
  }

// --------------------- Método findById
  

  public async findById(id: string): Promise<Order | undefined> {
    // TODO
    const order = this.ormRepository.findOne(id, {
      relations: ['order_products', 'customer'],
    });

    return order;
  }
}

export default OrdersRepository;
