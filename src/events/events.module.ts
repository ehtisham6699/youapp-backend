import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './events.gateway';
import { AuthService } from 'src/auth/services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/models/user.schema';
import { ChatModule } from 'src/chat/conversation.module';
import { UserModule } from 'src/user/user.module';
import { CustomSocketIoAdapter } from './io-adapter';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtStrategy } from 'src/shared/strategies/jwt.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/services/user.service';
import { ConversationService } from 'src/chat/services/conversation.service';
import { MessageService } from 'src/chat/services/message.service';
import { MessageSchema } from 'src/chat/models/message.schema';
import { ConversationSchema } from 'src/chat/models/conversation.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: '###secret',
      // signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ChatModule),
    forwardRef(() => UserModule),
  ],
  providers: [
    ChatGateway,
    UserService,
    ConversationService,
    MessageService,
    AuthService,
    CustomSocketIoAdapter,
    jwtStrategy,
    ChatModule,
  ],
  exports: [ChatGateway, CustomSocketIoAdapter],
})
export class EventsModule {}
