import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/conversation.module';
import { RouterModule } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [AuthModule, UserModule, ChatModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forRoot("mongodb://localhost:27017/youApp", {}),
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
  providers: [],
})
export class AppModule {}
