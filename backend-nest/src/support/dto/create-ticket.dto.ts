import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString() @MinLength(2) subject!: string;
  @IsIn(['technical', 'membership', 'payment', 'id-card', 'general']) category!: string;
  @IsOptional() @IsIn(['low', 'medium', 'high', 'urgent']) priority?: string;
  @IsString() @MinLength(5) description!: string;
}
