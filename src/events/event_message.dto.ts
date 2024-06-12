import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { Types } from 'mongoose';
enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}
export class CreateMessageDto {
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
  @IsMongoId()
  conversationId: Types.ObjectId;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Links to media files',
    type: [String],
    example: ['http://example.com/media1.png', 'http://example.com/media2.png'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  mediaLinks?: string[];

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
    description: 'ID of the media file',
    example: '60d0fe4f5311236168a109cc',
    required: false,
  })
  @IsString()
  @IsOptional()
  mediaId?: string;

  @ApiProperty({
    description: 'Indicates if the message is delivered',
    example: false,
    default: false,
  })
  @IsBoolean()
  isDelivered: boolean;

  @ApiProperty({
    description: 'Indicates if the message contains media',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isMedia?: boolean;

  @ApiProperty({
    description: 'Type of the message',
    example: 'text',
    required: false,
  })
  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @ApiProperty({
    description: 'ID of the message this message is replying to',
    type: String,
    example: '60d0fe4f5311236168a109cd',
    required: false,
  })
  @IsString()
  @IsOptional()
  replyToMessage: Types.ObjectId;
}
