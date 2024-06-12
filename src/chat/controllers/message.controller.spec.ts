import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../controllers/message.controller';
import { MessageService } from '../services/message.service';
import { ApiResponse } from 'src/utils/response.utils';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
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

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMessagesByConversation', () => {
    it('should return messages by conversation', async () => {
      const conversationId = '60df099ed8dffb33d87d8ef1';
      const page = 1;
      const pageSize = 10;
      const userId = 'userId';

      const messages = [
        // Mock messages data
      ];

      jest.spyOn(service, 'getMessagesByConversation').mockResolvedValueOnce({
        statusCode: HttpStatus.ACCEPTED,
        message: 'Messages retrieved',
        data: {
          conversation: {
            // Mock conversation data
          },
          messages: messages,
        },
      });

      const response = await controller.getMessagesByConversation(
        conversationId,
        page,
        pageSize,
        { user: { _id: userId } },
      );

      expect(response).toBeDefined();
      expect(response.statusCode).toBe(HttpStatus.ACCEPTED);
      expect(response.message).toBe('Messages retrieved');
      expect(response.data.conversation).toBeDefined();
      expect(response.data.messages).toEqual(messages);
    });

    it('should handle errors', async () => {
      const conversationId = '60df099ed8dffb33d87d8ef1';
      const page = 1;
      const pageSize = 10;
      const userId = 'userId';

      jest.spyOn(service, 'getMessagesByConversation').mockResolvedValueOnce({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving messages',
        data: null,
      });

      const response = await controller.getMessagesByConversation(
        conversationId,
        page,
        pageSize,
        { user: { _id: userId } },
      );

      expect(response).toBeDefined();
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.message).toBe('Error retrieving messages');
      expect(response.data).toBeNull();
    });
  });
});
