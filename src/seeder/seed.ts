import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { user_role } from '../modules/users/entities/user.entity';

async function runSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com')
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';
  const dateOfBirth = process.env.ADMIN_DOB || '1990-01-01';
  const gender = (process.env.ADMIN_GENDER || 'OTHER').toUpperCase();

  const existing = await usersService.findByEmail(email);
  if (existing) {
    console.log(`Admin user already exists (${email}).`);
    await app.close();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await usersService.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password_hash: hashed,
    date_of_birth: new Date(dateOfBirth),
    gender: gender as any,
    role: user_role.ADMIN,
  });

  console.log(`Admin user created: ${email}`);
  console.log(`  password: ${password}`);

  await app.close();
}

runSeeder().catch((err) => {
  console.error(err);
  process.exit(1);
});
