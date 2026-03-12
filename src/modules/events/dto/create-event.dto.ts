import { IsString, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { event_type } from '../enums/event-type.enum';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsInt()
  max_attendees: number;

  @IsDateString()
  event_date: Date;

  @IsString()
  event_type: event_type;
}
