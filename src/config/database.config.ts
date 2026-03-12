import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: join(__dirname, '../../data/database.sqlite'),

  autoLoadEntities: true,
  synchronize: true,
};
