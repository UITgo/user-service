import { IsString, IsNotEmpty, Matches, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  authId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÀ-ỹ\s]+$/)
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PASSENGER', 'DRIVER'])
  role: 'PASSENGER' | 'DRIVER';
}
