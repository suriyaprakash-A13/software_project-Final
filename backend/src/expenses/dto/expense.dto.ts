import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  ACCOMMODATION = 'ACCOMMODATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  UTILITIES = 'UTILITIES',
  SHOPPING = 'SHOPPING',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export class CreateExpenseDto {
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsUUID()
  payerId: string;

  @IsUUID()
  groupId: string;
}

export class UpdateExpenseDto {
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  description?: string;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;
}
