import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { ProfileDto } from '../dtos/profile.dto';
import { User } from '../models/user.schema';
import { ApiResponse } from 'src/utils/response.utils';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            updateProfile: jest.fn(),
            getProfile: jest.fn(),
            blockOrUnblockUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const profileDto: ProfileDto = {
        // Provide valid profile data here
      };
      const files = {
        // Provide valid files here
      };
      const req = {
        user: {
          _id: 'userId',
        },
      };
      const expectedResult: ApiResponse<User[]> = {
        statusCode: 200,
        data: '',
        message: 'profile updated',
      };

      jest
        .spyOn(userService, 'updateProfile')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.updateProfile(profileDto, files, req);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const req = {
        user: {
          _id: 'userId',
        },
      };
      const expectedResult: ApiResponse<User[]> = {
        statusCode: 200,
        data: '',
        message: 'profile fetched',
      };

      jest
        .spyOn(userService, 'getProfile')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.getProfile(req);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('blockOrUnblockUser', () => {
    it('should block or unblock user', async () => {
      const block = true; // or false
      const userId = 'userId';
      const req = {
        user: {
          _id: 'currentUser',
        },
      };

      const expectedResult = {};
      //@ts-ignore
      jest
        .spyOn(userService, 'blockOrUnblockUser')
        //@ts-ignore
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.blockOrUnblockUser(block, userId, req);

      expect(result).toEqual(expectedResult);
    });
  });
});
