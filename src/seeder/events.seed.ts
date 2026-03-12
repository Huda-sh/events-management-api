import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Event } from '../modules/events/entities/event.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { User } from '../modules/users/entities/user.entity';

async function runEventSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventRepo = app.get<Repository<Event>>(getRepositoryToken(Event));
  const auditRepo = app.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com')
    .trim()
    .toLowerCase();
  const admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    console.error(
      `Admin user not found: ${adminEmail}. Run \`pnpm run seed\` first.`,
    );
    await app.close();
    process.exit(1);
  }

  const types = ['CONFERENCE', 'WEBINAR', 'WORKSHOP'];

  const templates = {
    CONFERENCE: [
      {
        name: 'Future of AI Conference',
        description:
          'A full-day conference exploring AI trends, ethics, and real-world implementation.',
      },
      {
        name: 'Global Tech Leadership Summit',
        description:
          'Business leaders share insights on building resilient engineering organizations.',
      },
      {
        name: 'Data & Analytics Expo',
        description:
          'Learn how modern data platforms are transforming business intelligence.',
      },
    ],
    WEBINAR: [
      {
        name: 'Building REST APIs with NestJS',
        description:
          'Hands-on demo of building scalable APIs using NestJS and TypeORM.',
      },
      {
        name: 'Secure JWT Authentication',
        description:
          'Learn best practices for implementing secure JWT auth in Node.js applications.',
      },
      {
        name: 'Testing Strategies for Node',
        description:
          'How to write reliable unit and integration tests for backend services.',
      },
    ],
    WORKSHOP: [
      {
        name: 'Docker + Node: Deployment Workshop',
        description:
          'Build and containerize a Node application end-to-end using Docker.',
      },
      {
        name: 'Database Performance Tuning',
        description:
          'Learn query optimization techniques for SQLite and other common databases.',
      },
      {
        name: 'TypeScript Deep Dive',
        description:
          'Hands-on workshop on advanced TypeScript patterns and typings.',
      },
    ],
  };

  const events: Partial<Event>[] = [];
  const now = Date.now();

  for (let i = 1; i <= 20; i += 1) {
    const isPast = i % 2 === 0;
    const daysOffset = i * 2;
    const date = new Date(
      isPast
        ? now - daysOffset * 24 * 60 * 60 * 1000
        : now + daysOffset * 24 * 60 * 60 * 1000,
    );

    const type = types[i % types.length] as keyof typeof templates;
    const variant = templates[type][i % templates[type].length];

    events.push({
      name: variant.name,
      description: variant.description,
      max_attendees: 20 + (i % 5) * 5,
      event_date: date,
      event_type: type as any,
      creator: admin,
    });
  }

  const created = await eventRepo.save(events as Event[]);

  for (const ev of created) {
    await auditRepo.save({
      admin_id: admin.id,
      action: 'SEED CREATE',
      entity: 'events',
      entity_id: ev.id,
    });
  }

  console.log(`Created ${created.length} events and logged audit entries.`);

  await app.close();
}

runEventSeeder().catch((err) => {
  console.error(err);
  process.exit(1);
});
