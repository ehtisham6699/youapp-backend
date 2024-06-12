import { Module } from '@nestjs/common';
import { SocketEventsController } from './socketEvent.controller';
import { SocketEventsService } from './socketEvent.service';

@Module({
  controllers: [SocketEventsController],
  providers: [SocketEventsService],
})
export class SocketEventsModule {}
