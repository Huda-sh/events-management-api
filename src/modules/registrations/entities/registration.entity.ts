import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { education_level } from '../enums/education-level.enum';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  registered_at: Date;

  @Column({ nullable: true })
  linkedin_profile?: string;

  @Column({ type: 'simple-enum', enum: education_level, nullable: true })
  education_level?: education_level;

  @Column({ type: 'text', nullable: true })
  motivation?: string;
}
