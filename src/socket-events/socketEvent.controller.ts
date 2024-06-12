import { Controller, Get } from '@nestjs/common';
import { SocketEventsService } from './socketEvent.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Socket-Events')
@Controller('socket-events')
export class SocketEventsController {
  constructor(private readonly socketEventsService: SocketEventsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Execute this and in response you will get all events and payloads for socket',
  })
  getAllEvents() {
    return {
      events: this.socketEventsService.events,
      payloads: this.socketEventsService.payloads,
    };
  }
}
