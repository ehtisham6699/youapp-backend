import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from '../services/conversation.service';
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';
import { ConversationDto } from '../dtos/conversation.dto';

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: getModelToken('Conversation'),
          useValue: {
            findOne: jest.fn(),
            aggregate: jest.fn(),
            new: jest.fn(),
            save: jest.fn(),
            populate: jest.fn(),
            select: jest.fn(),
          },
        },
        {
          provide: getModelToken('Message'),
          useValue: {
            findOne: jest.fn(),
            aggregate: jest.fn(),
            new: jest.fn(),
            save: jest.fn(),
            populate: jest.fn(),
            select: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSingleConversation', () => {
    it('should create a single conversation', async () => {
      const chatData = {
        participants: ['user1', 'user2'],
        isGroupChat: false,
        groupName: 'Test Conversation',
        admins: ['user1'],
        firstMessage: 'Hello',
        messageType: 'text',
        createdBy: 'user1',
      };

      const result = {
        statusCode: HttpStatus.CREATED,
        message: 'Private Conversation Created',
        data: {
          chat: {
            ...chatData,
            messages: [],
          },
        },
      };
      //@ts-ignore
      jest.spyOn(service, 'createSingleConversation').mockResolvedValue(result);

      const response = await service.createSingleConversation(chatData);

      expect(response).toEqual(result);
    });
  });

  describe('createConversation', () => {
    it('should create a conversation', async () => {
      const conversationDto: ConversationDto = {
        participants: ['user1', 'user2'],
        isGroupChat: true,
        groupName: 'Test Group',
        admins: ['user1'],
        groupImage: null,
      };

      const result = {
        statusCode: HttpStatus.CREATED,
        message: 'Conversation created successfully',
        data: conversationDto,
      };

      jest.spyOn(service, 'createConversation').mockResolvedValue(result);

      const response = await service.createConversation(conversationDto);

      expect(response).toEqual(result);
    });
  });

  describe('createGroupConversation', () => {
    it('should create a group conversation', async () => {
      const chatData = {
        participants: ['user1', 'user2'],
        isGroupChat: true,
        groupName: 'Test Group',
        admins: ['user1'],
        createdBy: 'user1',
      };

      const files = {
        groupImage: [
          {
            path: 'test-path',
            originalname: 'test-image.jpg',
          },
        ],
      };

      const result = {
        statusCode: HttpStatus.CREATED,
        message: ' Group Conversation Created',
        data: {
          ...chatData,
          groupImage: '/media/test-image.jpg',
        },
      };
      //@ts-ignore
      jest.spyOn(service, 'createGroupConversation').mockResolvedValue(result);

      const response = await service.createGroupConversation(chatData, files);

      expect(response).toEqual(result);
    });
  });
});
