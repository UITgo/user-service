import { Controller, Get, Post, Patch, Put, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createuser(createUserDto);
  }

  @Patch(':authId/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@Param('authId') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(id, file);
  }

  @Get(':authId')
  findOne(@Param('authId') authId: string) {
    return this.userService.getUserbyId(authId);
  }


}
