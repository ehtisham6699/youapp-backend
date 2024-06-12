import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/conversation.module';
import { RouterModule } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CustomSocketIoAdapter } from './events/io-adapter';
import { EventsModule } from './events/events.module';
import { JWT_SECRET, MONGO_URI } from './config/config';
import { SocketEventsModule } from './socket-events/socketEvent.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
    SocketEventsModule,
    EventsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      // signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forRoot(MONGO_URI, {}),
    RouterModule.register([
      {
        path: 'api/v1',
        children: [
          {
            path: 'auth',
            module: AuthModule,
          },
          {
            path: 'user',
            module: UserModule,
          },
          {
            path: 'chat',
            module: ChatModule,
          },
        ],
      },
    ]),
  ],
  controllers: [],
  providers: [CustomSocketIoAdapter],
})
export class AppModule implements NestModule {
  constructor(private readonly customAdapter: CustomSocketIoAdapter) {}
  configure(consumer: MiddlewareConsumer): void {}
}
