import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  admin_id: number;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column({ nullable: true })
  entity_id: number;

  @CreateDateColumn()
  created_at: Date;
}
