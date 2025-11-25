import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Tạo user từ auth-service (authId + fullname + role)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createuser(createUserDto);
  }

  // Upload / cập nhật avatar theo authId
  @Patch(':authId/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Param('authId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(id, file);
  }

  // Lấy user theo authId (dùng cho debug / admin)
  @Get(':authId')
  findOne(@Param('authId') authId: string) {
    return this.userService.getUserbyId(authId);
  }

  // Lấy "me" dựa trên X-User-Id do API Gateway set sau khi verify JWT
  @Get('me')
  async me(@Req() req: any) {
    const authId = req.headers['x-user-id'] as string | undefined;
    if (!authId) {
      throw new BadRequestException('X-User-Id header is missing');
    }

    const user = await this.userService.getUserbyId(authId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
