import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateMessageDto {
  sender: Types.ObjectId;

  @IsMongoId()
  conversationId: Types.ObjectId;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  mediaLinks?: string[];

  @IsArray()
  @IsOptional()
  docLinks?: string[];

  @IsString()
  @IsOptional()
  mediaId?: string;

  @IsBoolean()
  isDelivered: boolean;

  @IsBoolean()
  @IsOptional()
  isMedia?: boolean;

  @IsString()
  @IsOptional()
  messageType?: string;

  @IsString()
  @IsOptional()
  replyToMessage: Types.ObjectId;
}
