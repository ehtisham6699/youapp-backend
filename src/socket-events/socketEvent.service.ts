import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketEventsService {
  readonly events = {
    NEW_MESSAGE: 'send_message',
    ERROR: 'error',
    AUTHENTICATION_ERROR: 'authError',
    UNSEEN_MESSAGES_LENGTH: 'unread_message_count',
    MESSAGE_RECEIVE: 'receive',
    CONVERSATION_OPEN: 'conversation_opened',
    MESSAGE_SEEN: 'checkmark',
  };

  readonly payloads = {
    [this.events.NEW_MESSAGE]: {
      senderId: 'string',
      conversationId: 'string',
      content: 'string',
      isPersonalMessage: 'boolean',
      messageType: 'text',
    },

    [this.events.CONVERSATION_OPEN]: {
      senderId: 'string',
      conversationId: 'string',
      conversationClicked: 'boolean',
    },
  };
}
