import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class PrivateConversationDto {
  @ApiProperty({
    description: 'Array of participant IDs',
    type: [String],
    example: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'],
  })
  @IsArray()
  participants: Types.ObjectId[];

  @ApiProperty({
    description: 'Indicates if the chat is a group chat',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isGroupChat?: boolean;

  @ApiProperty({
    description: 'Type of the message',
    example: 'text',
    required: false,
  })
  @IsString()
  @IsOptional()
  messageType?: string;
}
