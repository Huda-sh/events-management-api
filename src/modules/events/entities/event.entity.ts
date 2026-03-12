import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../users/entities/user.entity'; // تأكدي من المسار
import { event_type } from '../enums/event-type.enum';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  max_attendees: number;

  @Column({ type: 'datetime', unique: true })
  event_date: Date;

  @Column({ type: 'simple-enum', enum: event_type })
  event_type: event_type;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];
}
