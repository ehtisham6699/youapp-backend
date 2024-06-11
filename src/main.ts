import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomSocketIoAdapter } from './events/io-adapter';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
async function bootstrap() {
  const Eapp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(Eapp));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.useWebSocketAdapter(new CustomSocketIoAdapter(app));
  app.enableCors({
    origin: ['*', 'http://localhost:4000', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  await app.listen(process.env.PORT || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
