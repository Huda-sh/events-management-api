import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { user_role } from '../users/entities/user.entity';
import { RegistrationsService } from '../registrations/registrations.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const user = req.user as any;
    return this.eventsService.create(dto, user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.eventsService.findAll(
      Number(page),
      Number(limit),
      search,
      type,
      dateFrom,
      dateTo,
    );
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  findUpcoming(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.eventsService.findUpcoming(
      Number(page),
      Number(limit),
      search,
      type,
      dateFrom,
      dateTo,
    );
  }

  @Get('attended')
  @UseGuards(JwtAuthGuard)
  async myEvents(@Req() req: Request) {
    const user = req.user as any;
    return this.registrationsService.getUserRegistrations(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as any;
    const allowPast = user?.role === user_role.ADMIN;
    return this.eventsService.findOne(id, allowPast);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  update(@Param('id') id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  remove(@Param('id') id: number) {
    return this.eventsService.remove(id);
  }
}
