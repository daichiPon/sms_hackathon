import { IsString, Matches } from 'class-validator';

export class VerifySmsDto {
  @IsString()
  id!: string;

  @IsString()
  @Matches(/^\d{4,6}$/)
  code!: string;
}
