import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../auth/services/auth.service';
import { AuthController } from '../auth/controllers/auth.controller';
import { User, UserSchema } from '../user/models/user.schema';
import { UserService } from '../user/services/user.service';
import { jwtStrategy } from '../shared/strategies/jwt.strategy';
import { ConversationSchema } from 'src/chat/models/conversation.schema';
import { MessageSchema } from 'src/chat/models/message.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: '###secret',
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, jwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
