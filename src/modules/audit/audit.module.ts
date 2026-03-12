import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { AuditController } from './audit.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditInterceptor],
  controllers: [AuditController],
  exports: [AuditInterceptor, TypeOrmModule],
})
export class AuditModule {}
