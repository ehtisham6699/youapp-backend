import { Module, forwardRef } from '@nestjs/common';
import { ConversationService } from '../chat/services/conversation.service';
import { ConversationController } from './controllers/conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/models/user.schema';
import { MessageSchema } from './models/message.schema';
import { ConversationSchema } from './models/conversation.schema';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
    ]),
  ],
  providers: [ConversationService, MessageService],
  controllers: [ConversationController, MessageController],
  exports: [ConversationService, MessageService],
})
export class ChatModule {}
