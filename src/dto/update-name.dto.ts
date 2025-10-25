import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÀ-ỹ\s]+$/)
  fullname: string;
}
