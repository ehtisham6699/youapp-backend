import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class ConversationDto {
  @IsArray()
  participants: Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  isGroupChat?: boolean;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsArray()
  @IsOptional()
  admins?: string[];

  @IsString()
  @IsOptional()
  messageType?: string;
}
