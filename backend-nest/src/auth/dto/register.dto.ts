import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsIn(['ALUMNI', 'AMBASSADOR', 'alumni', 'ambassador'])
  userType!: 'ALUMNI' | 'AMBASSADOR' | 'alumni' | 'ambassador';

  @IsOptional()
  @IsString()
  stateBase?: string;

  @IsOptional()
  @IsString()
  stateBaseCode?: string;

  @IsOptional()
  @IsString()
  stateBaseName?: string;
}
