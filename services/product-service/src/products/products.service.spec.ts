import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product, ProductCategory } from './product.entity';

const mockProduct: Product = {
  id: 'uuid-1',
  name: 'Elegantni Sat',
  description: 'Klasican muski sat',
  price: 12000,
  stock: 10,
  imageUrl: 'https://example.com/sat.jpg',
  category: ProductCategory.WATCHES,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('treba da vrati sve proizvode', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Elegantni Sat');
    });

    it('treba da filtrira po kategoriji', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      await service.findAll(ProductCategory.WATCHES);

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { category: ProductCategory.WATCHES },
      });
    });
  });

  describe('findOne', () => {
    it('treba da vrati proizvod po ID-u', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('uuid-1');

      expect(result.id).toBe('uuid-1');
      expect(result.name).toBe('Elegantni Sat');
    });

    it('treba da baci NotFoundException ako proizvod ne postoji', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nepostoji')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('treba da kreira novi proizvod', async () => {
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'Elegantni Sat',
        price: 12000,
        stock: 10,
        category: ProductCategory.WATCHES,
      });

      expect(result.name).toBe('Elegantni Sat');
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('treba da azurira proizvod', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('uuid-1', { price: 15000 });

      expect(mockProductRepository.update).toHaveBeenCalledWith('uuid-1', { price: 15000 });
    });

    it('treba da baci NotFoundException za nepostojeci proizvod', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nepostoji', { price: 100 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('treba da obrise proizvod', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);

      const result = await service.remove('uuid-1');

      expect(result.message).toBe('Proizvod obrisan');
      expect(mockProductRepository.remove).toHaveBeenCalledWith(mockProduct);
    });
  });
});
