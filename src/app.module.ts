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

@Module({
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
    EventsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: '###secret',
      // signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/youApp', {}),
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
