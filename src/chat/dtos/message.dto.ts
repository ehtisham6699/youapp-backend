import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Types } from 'mongoose';

enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}

export class MessageDto {
  sender: Types.ObjectId;

  @IsString()
  conversationId: Types.ObjectId;

  @IsString()
  @IsOptional()
  content: string;

  @IsBoolean()
  @IsOptional()
  isPersonalMessage?: boolean;

  @IsArray()
  @IsOptional()
  mediaLinks?: any[];

  @IsArray()
  @IsOptional()
  docLinks?: string[];

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: string;

  @IsArray()
  @IsOptional()
  contactList?: string[];

  @IsString()
  @IsOptional()
  replyToMessage: Types.ObjectId;
}
