import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/models/user.schema';
import { RegistrationDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { LoginDto } from '../dtos/login.dto';

const jwtServiceMock = {
  sign: jest.fn(),
};

describe('AuthController', () => {
  let service: AuthService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const registrationDto: RegistrationDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        confirmPassword: 'password',
      };

      userModel.findOne = jest.fn().mockResolvedValue(null);

      userModel.create = jest.fn().mockResolvedValueOnce({
        _id: '66695b5f2318648f94e34ade',
        ...registrationDto,
      });

      const result = await service.registerUser(registrationDto);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('User registered successfully');
      expect(result.data).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      userModel.findOne = jest.fn().mockResolvedValueOnce({
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      bcrypt.compare = jest.fn().mockResolvedValueOnce(true);

      const accessToken = 'mockAccessToken';
      jwtServiceMock.sign.mockReturnValueOnce(accessToken);

      const result = await service.login(loginDto);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Login successful');
      expect(result.data).toEqual({ accessToken });
    });

    it('should return Unauthorized status code with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      userModel.findOne = jest.fn().mockResolvedValueOnce(null);

      const result = await service.login(loginDto);

      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Invalid email or password');
      expect(result.data).toBeNull();
    });
  });
});
