import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RegisterReunionDto {
  @IsString() @MinLength(2) fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
  @IsString() @MinLength(2) school!: string;
  @Transform(({ value }) => Number(value)) @IsInt() graduationYear!: number;
  @IsString() attendanceType!: string;
  @IsOptional() @IsString() stateBaseCode?: string;
  @IsOptional() @IsString() @MinLength(1) paymentReference?: string;
  @Transform(({ value }) => value === '' || value == null ? undefined : Number(value))
  @IsOptional() @IsInt() @Min(1) amountPaid?: number;
}
