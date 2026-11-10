import { IsString, MinLength } from 'class-validator';

export class RespondTicketDto {
  @IsString() @MinLength(1) message!: string;
}
