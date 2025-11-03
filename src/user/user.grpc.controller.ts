import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class UserGrpcController {
  @GrpcMethod('UserService', 'GetProfile')
  getProfile({ user_id }: { user_id: string }) {
    // demo: có user_id là coi như tồn tại
    return {
      exists: !!user_id,
      user_id,
      name: 'Pham Thi Kieu Diem',    };
  }
}
