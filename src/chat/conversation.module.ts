import { Module } from '@nestjs/common';
import { ConversationService } from '../chat/services/conversation.service';
import { ConversationController } from './controllers/conversation.controller';

@Module({
  providers: [ConversationService],
  controllers: [ConversationController]
})
export class ChatModule {}
