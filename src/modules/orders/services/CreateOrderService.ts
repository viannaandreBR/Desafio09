// import { OrdersProducts } from '@modules/orders/infra/typeorm/entities/OrdersProducts';
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(

    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO

    const customerExists = await this.customersRepository.findById(customer_id);

    if(!customerExists){
      throw new AppError('Could not find any customer with the givern id');
    }

    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existentProducts.length){
      throw new AppError('Coult not find any products with the given ids');
    }

    const existentProductsIds = existentProducts.map(product => product.id);

    const checkInexistentsProducts = products.filter(
      product => !existentProductsIds.includes(product.id),
    );

    if (checkInexistentsProducts.length) {
      throw new AppError (
        `could not find product ${checkInexistentsProducts[0].id}`,
      );
    }

    const findProductsWithNoQuantityAvailable = products.filter(
      product => 
        existentProducts.filter( p => p.id === product.id)[0].quantity < product.quantity,
    );

    if (findProductsWithNoQuantityAvailable.length) {
      throw new AppError(`The quantity ${findProductsWithNoQuantityAvailable[0].quantity} is not available for ${findProductsWithNoQuantityAvailable[0].id}`
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existentProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const ordersProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        existentProducts.filter(p=> p.id === product.product_id)[0].quantity - product.quantity,
    }));

    await this.productsRepository.updateQuantity(ordersProductsQuantity);

    return order;

  }
}

export default CreateOrderService;
