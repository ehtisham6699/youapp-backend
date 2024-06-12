import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { Message } from '../models/message.schema';
import { ApiResponse } from 'src/utils/response.utils';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Message')
@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Get all Messages' })
  @ApiBearerAuth()
  @Get('/getMessages')
  @UseGuards(AuthGuard('jwt'))
  async getMessagesByConversation(
    @Query('conversationId') conversationId: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: any,
  ): Promise<ApiResponse<Message[]>> {
    const userId = req.user._id;
    console.log(userId);

    return await this.messageService.getMessagesByConversation(
      conversationId,
      userId,
      page,
      pageSize,
    );
  }
}
