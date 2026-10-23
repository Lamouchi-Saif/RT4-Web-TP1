import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe, VersioningType } from '@nestjs/common';

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
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
