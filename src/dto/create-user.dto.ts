import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  authId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÀ-ỹ\s]+$/)
  fullname: string;
}
