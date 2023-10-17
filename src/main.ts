import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common/pipes';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized-exception.filter';
import * as functions from 'firebase-functions';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();

export const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  app.enableCors({
    origin: '*',
    credentials: true,
    allowedHeaders: '*',
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(
    new UnauthorizedExceptionFilter({
      MELICLIENTID: process.env.MELI_CLIENT_ID,
      MELIREDIRECTURI: process.env.MELI_REDIRECT_URI,
      MELISECRET: process.env.MELI_SECRET,
    }),
  );

  //TODO: handle 429 error
  //TODO: usar el param ?attributes=id,title para traer los campos necesarios de los articulos

  return app.init();
};

//Listen
createNestServer(server).then(async (app) => {
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log('Listen on port:', PORT);
});

// Deploy on GCP
// createNestServer(server);
//   .then((v) => console.log('Nest app ready!'))
//   .catch((err) => console.error('Nest broken!', err));
// export const api = functions.https.onRequest(server);
