import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

    // -------------------- Método Create

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = await this.ormRepository.create({
      name,
      price,
      quantity
    })

    await this.ormRepository.save(product);

    return product;
  }

  
  // -------------------- Método findByName

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO

    const product = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return product;

  }

  // -------------------- Método findAllById

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO

    const productIds = products.map(product => product.id);

    const existentProducts = await this.ormRepository.find({
      where: {
        id:In(productIds), 
      },
    });

    return existentProducts;
  }


  
  // -------------------- Método updateQuantity

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO

    return this.ormRepository.save(products);
    
  }
}

export default ProductsRepository;
