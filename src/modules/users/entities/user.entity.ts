import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';

export enum user_role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  date_of_birth: Date;

  @Column({
    type: 'simple-enum',
    enum: gender,
    nullable: true,
  })
  gender: gender;

  @Column()
  password_hash: string;

  @Column({
    type: 'simple-enum',
    enum: user_role,
    default: user_role.USER,
  })
  role: user_role;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Registration, (registration) => registration.user)
  registrations: Registration[];
}
