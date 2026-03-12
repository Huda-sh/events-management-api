// events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), RegistrationsModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [TypeOrmModule, EventsService],
})
export class EventsModule {}
