import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async (data) => {
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
          const entity =
            request.baseUrl?.split('/')[1] || request.url.split('/')[1];

          const entityId =
            data?.id || data?.data?.id || request.params?.id || null;

          await this.auditRepo.save({
            admin_id: user?.id || null,
            action: `${request.method} ${request.url}`,
            entity,
            entity_id: entityId,
          });
        }
      }),
    );
  }
}
