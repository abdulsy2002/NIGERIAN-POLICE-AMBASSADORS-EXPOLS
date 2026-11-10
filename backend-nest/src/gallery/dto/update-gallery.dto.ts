import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGalleryDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
}
