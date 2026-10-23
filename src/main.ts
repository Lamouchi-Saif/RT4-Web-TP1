import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true,            // convert the JSON body into a DTO instance
    whitelist: true,            // drop properties that have no validation decorator
    forbidNonWhitelisted: true, // reject the request if unknown properties are sent
  }),
);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
