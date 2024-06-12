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
import { uploadInterceptor } from '../../shared/interceptors/fileUpload.interceptor';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PrivateConversationDto } from '../dtos/privateConversation.dto';
@ApiTags('Conversation')
@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOperation({ summary: 'Create Single Conversation' })
  @ApiBearerAuth()
  @ApiBody({ type: PrivateConversationDto })
  @Post('/privateChat')
  async registerSingleConversation(@Body() Data: PrivateConversationDto) {
    return await this.conversationService.createSingleConversation(Data);
  }

  @ApiOperation({ summary: 'Create Group Conversation' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ConversationDto })
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
