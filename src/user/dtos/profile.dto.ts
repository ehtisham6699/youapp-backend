import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  isDate,
  isNumber,
} from 'class-validator';

export class ProfileDto {
  _id: string;

  @IsOptional()
  profileImage?: string;

  @IsOptional()
  @IsString()
  birthDay?: string;

  @IsOptional()
  @IsString()
  horoscope?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  zodiac?: Date;
}
