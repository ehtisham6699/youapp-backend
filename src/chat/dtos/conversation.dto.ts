import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class ConversationDto {
  @ApiProperty({
    description: 'Array of participant IDs',
    type: [String],
    example: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'],
  })
  @Transform(({ value }) => value.split(','))
  @IsArray()
  participants: string[];

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the chat is a group chat',
    default: false,
    example: true,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isGroupChat?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Group image upload',
  })
  @IsOptional()
  groupImage?: any;

  @ApiProperty({
    description: 'Name of the group chat',
    example: 'Developers Group',
    required: false,
  })
  @IsString()
  @IsOptional()
  groupName?: string;

  @ApiProperty({
    description: 'Array of admin IDs',
    type: [String],
    example: ['60d0fe4f5311236168a109ca'],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @IsArray()
  admins?: string[];

  @ApiProperty({
    description: 'Type of the message',
    example: 'text',
    required: false,
  })
  @IsString()
  @IsOptional()
  messageType?: string;
}
