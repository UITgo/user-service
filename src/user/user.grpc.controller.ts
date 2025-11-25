import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserGrpcController {
  constructor(private readonly users: UserService) {}

  @GrpcMethod('UserService', 'GetProfile')
  async getProfile({ user_id }: { user_id: string }) {
    // Trong hệ thống của bạn, user_id bên ngoài = authId
    const user = await this.users.getUserbyId(user_id);

    if (!user) {
      return {
        exists: false,
        user_id,
        name: '',
        avatar_url: '',
        role: '',
      };
    }

    return {
      exists: true,
      user_id: user.authId,
      name: user.fullname,
      avatar_url: user.avatar ?? '',
      role: user.role, // 'PASSENGER' | 'DRIVER'
    };
  }
}
