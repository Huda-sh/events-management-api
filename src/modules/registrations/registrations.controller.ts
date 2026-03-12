import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { RegistrationsService } from './registrations.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { user_role } from '../users/entities/user.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private service: RegistrationsService) {}

  @Post(':eventId')
  @UseGuards(JwtAuthGuard)
  register(
    @Req() req: Request,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CreateRegistrationDto,
  ) {
    const user = req.user as any;
    return this.service.register(eventId, user.id, dto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.service.approve(id);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  attendees(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.getEventAttendees(eventId, Number(page), Number(limit));
  }
}
