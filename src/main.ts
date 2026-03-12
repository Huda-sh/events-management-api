import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const basePort = Number(process.env.PORT) || 3000;
  const maxTries = 5;

  for (let i = 0; i < maxTries; i++) {
    const port = basePort + i;
    try {
      await app.listen(port);
      console.log(`Application is running on: http://localhost:${port}`);
      return;
    } catch (err: any) {
      if (err?.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use; trying ${port + 1}...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    `Unable to start server: all ports ${basePort}-${basePort + maxTries - 1} are in use.`,
  );
}

bootstrap();
