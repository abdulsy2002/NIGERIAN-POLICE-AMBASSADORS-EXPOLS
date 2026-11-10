import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGalleryDto {
  @IsString() @MinLength(1) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() stateBaseCode?: string;
  @IsString() @MaxLength(8_400_000) image!: string;
}
