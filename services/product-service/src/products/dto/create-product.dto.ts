import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ProductCategory } from '../product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;
}
