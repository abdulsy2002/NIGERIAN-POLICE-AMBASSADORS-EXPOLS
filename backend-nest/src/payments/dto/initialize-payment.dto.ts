import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class InitializePaymentDto {
  @IsString() @MinLength(1) expolIdNumber!: string;
  @IsString() @MinLength(2) fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
  @IsString() @MinLength(1) purpose!: string;
  @IsOptional() @IsString() stateBaseCode?: string;
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) amount!: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() customReason?: string;
}
