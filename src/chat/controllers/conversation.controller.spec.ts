import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from '../controllers/conversation.controller';
import { ConversationService } from '../services/conversation.service';
import { ConversationDto } from '../dtos/conversation.dto';
import { PrivateConversationDto } from '../dtos/privateConversation.dto';
import { Types } from 'mongoose';

describe('ConversationController', () => {
  let controller: ConversationController;
  let service: ConversationService;

  const mockConversationService = {
    createSingleConversation: jest.fn(),
    createGroupConversation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        {
          provide: ConversationService,
          useValue: mockConversationService,
        },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerSingleConversation', () => {
    it('should create a single conversation', async () => {
      const privateConversationDto: PrivateConversationDto = {
        participants: [
          new Types.ObjectId('66695b5f2318648f94e34ade'),
          new Types.ObjectId('6669777f82667a80e508a799'),
        ],
        isGroupChat: false,
        messageType: 'text',
      };

      const result = {
        statusCode: 201,
        message: 'Private Conversation Created',
        data: { chat: { ...privateConversationDto, messages: [] } },
      };

      mockConversationService.createSingleConversation.mockResolvedValue(
        result,
      );

      const response = await controller.registerSingleConversation(
        privateConversationDto,
      );
      expect(response).toEqual(result);
      expect(service.createSingleConversation).toHaveBeenCalledWith(
        privateConversationDto,
      );
    });
  });

  describe('registerGroupConversation', () => {
    it('should create a group conversation', async () => {
      const conversationDto: ConversationDto = {
        participants: [
          '6669777f82667a80e508a799',
          '6669779325474e18379c5870',
          '666977974d054d388236c35b',
        ],
        isGroupChat: true,
        groupName: 'Test Group',
        admins: ['user1'],
        groupImage: null,
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
        statusCode: 201,
        message: 'Group Conversation Created',
        data: { chat: { ...conversationDto, messages: [] } },
      };

      mockConversationService.createGroupConversation.mockResolvedValue(result);

      const response = await controller.registerGroupConversation(
        conversationDto,
        files,
      );
      expect(response).toEqual(result);
      expect(service.createGroupConversation).toHaveBeenCalledWith(
        conversationDto,
        files,
      );
    });
  });
});
