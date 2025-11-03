import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { USER_PROTO, DRIVER_PROTO } from './common/proto-path';
import { UserGrpcController } from './user/user.grpc.controller';
import { HealthController } from './health.controller';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (cfg: ConfigService) => {
      const uri = cfg.get<string>('DB_URL') ?? 'mongodb://mongo:27017/users';
      // Optional: log nhẹ để kiểm tra (có thể bỏ sau khi OK)
      console.log('[user-service] DB_URL =', uri);
      return { uri }; // dùng uri có /users, KHÔNG cần dbName nữa
    },
  }),
    MulterModule.register({
      dest: './uploads', 
    }),
    UserModule,
  ],
  controllers: [AppController, UserGrpcController, HealthController],
  providers: [AppService],
})
export class AppModule {}
