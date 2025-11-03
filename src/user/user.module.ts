import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { S3Module } from '../s3/s3.module';
import { USER_PROTO, DRIVER_PROTO } from '../common/proto-path';
import { UserGrpcController } from '../user/user.grpc.controller';
import { HealthController } from '../health.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    S3Module
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], 
  
})

export class UserModule {}
