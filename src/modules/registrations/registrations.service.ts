import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { registration_status } from './enums/registration-status.enum';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,

    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async register(eventId: number, userId: number, dto: CreateRegistrationDto) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (new Date(event.event_date) < new Date()) {
      throw new BadRequestException('Event has already passed');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.registrationRepo.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });

    if (existing) {
      throw new BadRequestException('User already registered for this event');
    }

    const approvedCount = await this.registrationRepo.count({
      where: {
        event: { id: eventId },
        status: registration_status.APPROVED,
      },
    });

    if (approvedCount >= event.max_attendees) {
      throw new BadRequestException('Event capacity reached');
    }

    const registration = this.registrationRepo.create({
      user,
      event,
      status: registration_status.PENDING,
      linkedin_profile: dto.linkedinProfile,
      education_level: dto.educationLevel,
      motivation: dto.motivation,
    });

    const saved = await this.registrationRepo.save(registration);

    return {
      message: 'Registration submitted successfully',
      registrationId: saved.id,
      status: saved.status,
      eventId: event.id,
      userId: user.id,
    };
  }

  async approve(registrationId: number) {
    const registration = await this.registrationRepo.findOne({
      where: { id: registrationId },
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const event = registration.event;
    const approvedCount = await this.registrationRepo.count({
      where: { event: { id: event.id }, status: registration_status.APPROVED },
    });

    if (approvedCount >= event.max_attendees) {
      throw new BadRequestException('Event capacity reached');
    }

    registration.status = registration_status.APPROVED;

    const saved = await this.registrationRepo.save(registration);

    return {
      message: 'Registration approved successfully',
      registration: saved,
    };
  }

  async getEventAttendees(eventId: number, page = 1, limit = 20) {
    const [attendees, total] = await this.registrationRepo.findAndCount({
      where: { event: { id: eventId } },
      relations: ['user'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      message: 'Event attendees retrieved successfully',
      attendees,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null,
    };
  }

  async getUserRegistrations(userId: number) {
    const regs = await this.registrationRepo.find({
      where: { user: { id: userId } },
      relations: ['event'],
      order: { id: 'DESC' },
    });

    const events = regs.map((reg) => {
      const eventDate = new Date(reg.event.event_date);
      const isPast = eventDate < new Date();
      const status =
        isPast && reg.status === registration_status.APPROVED
          ? 'COMPLETED'
          : reg.status;

      return {
        event: reg.event,
        registrationStatus: reg.status,
        attendanceStatus: status,
      };
    });

    return {
      message: 'User registrations retrieved successfully',
      events,
    };
  }
}
