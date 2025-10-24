import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':authId')
  findOne(@Param('authId') authId: string) {
    return this.usersService.getUserByAuthId(authId);
  }

  @Patch(':authId')
  update(@Param('authId') authId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(authId, updateUserDto);
  }
}
