import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile image upload',
  })
  @IsOptional()
  profileImage?: any;

  @ApiPropertyOptional({
    description: 'User birth date',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  birthDay?: string;

  @ApiPropertyOptional({
    description: 'User horoscope sign',
    example: 'Aquarius',
  })
  @IsOptional()
  @IsString()
  horoscope?: string;

  @ApiPropertyOptional({
    description: 'User height in cm',
    example: '180',
  })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({
    description: 'User weight in kg',
    example: '75',
  })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({
    description: 'User zodiac sign',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  zodiac?: Date;

  @ApiPropertyOptional({
    description: 'Last seen date and time',
    example: '2023-06-11T12:34:56Z',
  })
  @IsOptional()
  @IsDateString()
  lastSeen?: Date;

  @ApiPropertyOptional({
    description: 'List of user interests',
    example: ['music', 'sports'],
  })
  @IsOptional()
  @IsString({ each: true })
  interests?: string[];
}
