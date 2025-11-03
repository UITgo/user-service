import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { USER_PROTO } from './common/proto-path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3001);

  const grpcApp = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: USER_PROTO,
      url: '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();
  // optional: console.log('user-service gRPC on :50051');
}
bootstrap();import { MicroserviceOptions, Transport } from '@nestjs/microservices';
