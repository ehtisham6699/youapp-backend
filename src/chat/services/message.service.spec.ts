import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../services/message.service';
import { Model } from 'mongoose';
import { Message } from '../models/message.schema';
import { Conversation } from '../models/conversation.schema';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

describe('MessageService', () => {
  let service: MessageService;
  let messageModel: Model<Message>;
  let conversationModel: Model<Conversation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken('Message'),
          useValue: Model,
        },
        {
          provide: getModelToken('Conversation'),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageModel = module.get<Model<Message>>(getModelToken('Message'));
    conversationModel = module.get<Model<Conversation>>(
      getModelToken('Conversation'),
    );
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {});

    it('should handle errors', async () => {});
  });

  describe('getMessagesByConversation', () => {
    it('should retrieve messages by conversation', async () => {});

    it('should handle errors', async () => {
      // Implement test case for error handling in getMessagesByConversation method
    });
  });
});
