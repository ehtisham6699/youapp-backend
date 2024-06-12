import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}

export class MessageDto {
  @ApiProperty({
    description: 'ID of the sender',
    type: String,
    example: '60d0fe4f5311236168a109ca',
  })
  @IsMongoId()
  sender: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the conversation',
    type: String,
    example: '60d0fe4f5311236168a109cb',
  })
  @IsString()
  conversationId: Types.ObjectId;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Indicates if the message is personal',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPersonalMessage?: boolean;

  @ApiProperty({
    description: 'Links to media files',
    type: [String],
    example: ['http://example.com/media1.png', 'http://example.com/media2.png'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  mediaLinks?: any[];

  @ApiProperty({
    description: 'Links to document files',
    type: [String],
    example: ['http://example.com/doc1.pdf', 'http://example.com/doc2.pdf'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  docLinks?: string[];

  @ApiProperty({
    description: 'Type of the message',
    enum: MessageType,
    example: MessageType.Text,
    required: false,
  })
  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @ApiProperty({
    description: 'List of contacts',
    type: [String],
    example: ['60d0fe4f5311236168a109cd', '60d0fe4f5311236168a109ce'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  contactList?: string[];

  @ApiProperty({
    description: 'ID of the message this message is replying to',
    type: String,
    example: '60d0fe4f5311236168a109cf',
    required: false,
  })
  @IsString()
  @IsOptional()
  replyToMessage: Types.ObjectId;
}
