import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() stateBaseCode?: string;
  @IsString() @MinLength(2) message!: string;
}
