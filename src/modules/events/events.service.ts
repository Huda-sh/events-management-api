import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

export interface PaginatedEvents {
  message?: string;
  items: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private applyFilters(
    qb: SelectQueryBuilder<Event>,
    search?: string,
    type?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const normalize = (value?: string) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      if (
        !trimmed ||
        trimmed.toLowerCase() === 'null' ||
        trimmed.toLowerCase() === 'undefined'
      ) {
        return undefined;
      }
      return trimmed;
    };

    const normalizedSearch = normalize(search);
    const normalizedType = normalize(type);
    const normalizedDateFrom = normalize(dateFrom);
    const normalizedDateTo = normalize(dateTo);

    if (normalizedSearch) {
      const term = `%${normalizedSearch.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(event.name) LIKE :term OR LOWER(event.description) LIKE :term)',
        { term },
      );
    }

    if (normalizedType) {
      qb.andWhere('LOWER(event.event_type) = LOWER(:type)', {
        type: normalizedType,
      });
    }

    if (normalizedDateFrom) {
      qb.andWhere('event.event_date >= :dateFrom', {
        dateFrom: new Date(normalizedDateFrom).toISOString(),
      });
    }

    if (normalizedDateTo) {
      qb.andWhere('event.event_date <= :dateTo', {
        dateTo: new Date(normalizedDateTo).toISOString(),
      });
    }

    return qb;
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    type?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<PaginatedEvents> {
    const safePage = Number(page) >= 1 ? Number(page) : 1;
    const safeLimit = Number(limit) >= 1 ? Number(limit) : 20;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .loadRelationCountAndMap('event.registrationCount', 'event.registrations')
      .orderBy('event.event_date', 'ASC');

    this.applyFilters(qb, search, type, dateFrom, dateTo);

    const [items, total] = await qb
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      message: 'Events retrieved successfully',
      items,
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

  async findUpcoming(
    page = 1,
    limit = 20,
    search?: string,
    type?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<PaginatedEvents> {
    const safePage = Number(page) >= 1 ? Number(page) : 1;
    const safeLimit = Number(limit) >= 1 ? Number(limit) : 20;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .loadRelationCountAndMap('event.registrationCount', 'event.registrations')
      .where('event.event_date > :now', { now: new Date().toISOString() })
      .orderBy('event.event_date', 'ASC');

    this.applyFilters(qb, search, type, dateFrom, dateTo);

    const [items, total] = await qb
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      message: 'Events retrieved successfully',
      items,
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

  async findOne(id: number, allowPast = false) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!allowPast && new Date(event.event_date) < new Date()) {
      throw new NotFoundException('Event not found');
    }

    const count = await this.eventRepository
      .createQueryBuilder('event')
      .loadRelationCountAndMap('event.registrationCount', 'event.registrations')
      .where('event.id = :id', { id })
      .getOne();

    return {
      message: 'Event retrieved successfully',
      ...event,
      registrationCount: count?.['registrationCount'] ?? 0,
    } as any;
  }

  async create(dto: CreateEventDto, creatorId?: number) {
    const existingEvent = await this.eventRepository.findOne({
      where: { event_date: dto.event_date },
    });

    if (existingEvent) {
      throw new ConflictException(
        'An event already exists at this date and time',
      );
    }

    const event = this.eventRepository.create(dto);

    if (creatorId) {
      event.creator = { id: creatorId } as any;
    }

    const saved = await this.eventRepository.save(event);
    return {
      message: 'Event created successfully',
      event: saved,
    };
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id, true);

    if (dto.event_date) {
      const existingEvent = await this.eventRepository.findOne({
        where: { event_date: dto.event_date },
      });

      if (existingEvent && existingEvent.id !== id) {
        throw new ConflictException(
          'Another event already exists at this date and time',
        );
      }
    }

    Object.assign(event, dto);
    const saved = await this.eventRepository.save(event);

    return {
      message: 'Event updated successfully',
      event: saved,
    };
  }

  async remove(id: number) {
    const event = await this.findOne(id, true);
    await this.eventRepository.remove(event);
    return { message: 'Event deleted successfully' };
  }
}
