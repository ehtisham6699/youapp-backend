import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { Conversation } from '../models/conversation.schema';
import { ApiResponse } from 'src/utils/response.utils';
import { ConversationDto } from '../dtos/conversation.dto';
import { uploadInterceptor } from 'src/shared/interceptors/fileUpload.interceptor';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('/privateChat')
  async registerSingleConversation(@Body() Data: ConversationDto) {
    return await this.conversationService.createSingleConversation(Data);
  }

  @Post('/groupChat')
  @UseInterceptors(new uploadInterceptor([{ name: 'groupImage', maxCount: 1 }]))
  async registerGroupConversation(
    @Body() Data: ConversationDto,
    @UploadedFiles() files,
  ) {
    try {
      return await this.conversationService.createGroupConversation(
        Data,
        files,
      );
    } catch (err) {
      console.log(err);
    }
  }
}
