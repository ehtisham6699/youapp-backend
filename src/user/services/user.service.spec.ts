import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../models/user.schema';
import { Message } from 'src/chat/models/message.schema';
import { Conversation } from 'src/chat/models/conversation.schema';
import { ProfileDto } from '../dtos/profile.dto';

describe('Userservice', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getModelToken('Message'),
          useValue: {},
        },
        {
          provide: getModelToken('Conversation'),
          useValue: {},
        },
      ],
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true }) // Mock AuthGuard
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const result = {
        statusCode: 200,
        message: 'Profile updated successfully',
        data: {},
      };
      jest.spyOn(service, 'updateProfile').mockResolvedValue(result);

      const body: ProfileDto = {
        birthDay: '1990-01-01',
        horoscope: 'Aquarius',
        height: '180',
        weight: '75',
        zodiac: new Date('1990-01-01'),
        lastSeen: new Date('2023-06-11T12:34:56Z'),
        interests: ['music', 'sports'],
      };
      const files = {};
      const req = { user: { _id: 'userId' } };

      expect(await controller.updateProfile(body, files, req)).toBe(result);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const result = {
        statusCode: 200,
        message: 'User fetched successfully',
        data: {},
      };
      jest.spyOn(service, 'getProfile').mockResolvedValue(result);

      const req = { user: { _id: 'userId' } };

      expect(await controller.getProfile(req)).toBe(result);
    });
  });

  describe('blockOrUnblockUser', () => {
    it('should block or unblock user', async () => {
      const result = {
        statusCode: 202,
        message: 'User blocked successfully',
        data: {},
      };
      jest.spyOn(service, 'blockOrUnblockUser').mockResolvedValue(result);

      const userId = 'targetUserId';
      const block = true;
      const req = { user: { _id: 'currentUserId' } };

      expect(await controller.blockOrUnblockUser(block, userId, req)).toBe(
        result,
      );
    });
  });
});
