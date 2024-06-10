import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './models/user.schema';
import { MessageSchema } from 'src/chat/models/message.schema';
import { ConversationSchema } from 'src/chat/models/conversation.schema';

@Module({
  imports:[MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
  MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }]),
  MongooseModule.forFeature([{ name: "Conversation", schema: ConversationSchema }])
],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
