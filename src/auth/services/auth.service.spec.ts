import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { HttpStatus } from '@nestjs/common';
import { RegistrationDto } from '../dtos/auth.dto';
import { LoginDto } from '../dtos/login.dto';
import { Types } from 'mongoose';
import { UserDocument } from 'src/user/models/user.schema';
import {} from '@nestjs/mongoose';
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        // Mock JwtService and provide a mock token
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
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

      const hashedPassword = await bcrypt.hash(registrationDto.password, 10);

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(null);
      const userMock: RegistrationDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        confirmPassword: 'differentpassword',
      };

      jest
        .spyOn(service['userModel'], 'create')
        //@ts-ignore
        .mockResolvedValueOnce(userMock);
      const result = await service.registerUser(registrationDto);

      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('User registered successfully');
      expect(result.data).toBeDefined();
    });

    it('should handle passwords not matching', async () => {
      const registrationDto: RegistrationDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        confirmPassword: 'differentpassword',
      };

      const result = await service.registerUser(registrationDto);

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual('Passwords do not match');
    });

    it('should handle existing users', async () => {
      const registrationDto: RegistrationDto = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password',
        confirmPassword: 'password',
      };

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce({
        _id: 'existingId',
        email: registrationDto.email,
        username: registrationDto.username,
        password: 'hashedpassword',
      });

      const result = await service.registerUser(registrationDto);

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual('Email already in use');
    });

    it('should handle registration error', async () => {
      const registrationDto: RegistrationDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        confirmPassword: 'password',
      };

      jest
        .spyOn(service['userModel'], 'findOne')
        .mockRejectedValueOnce(new Error('Mock error'));

      const result = await service.registerUser(registrationDto);

      expect(result.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toEqual('Error registering user');
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce({
        _id: 'mockId',
        email: loginDto.email,
        password: hashedPassword,
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('mockToken');

      const result = await service.login(loginDto);

      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('Login successful');
      expect(result.data).toBeDefined();
      expect(result.data.accessToken).toEqual('mockToken');
    });

    it('should handle invalid email or password', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(null);

      const result = await service.login(loginDto);

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
      expect(result.message).toEqual('Invalid email or password');
    });

    it('should handle invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce({
        _id: 'mockId',
        email: loginDto.email,
        password: hashedPassword,
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      const result = await service.login(loginDto);

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
      expect(result.message).toEqual('Invalid email or password');
    });

    it('should handle login error', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest
        .spyOn(service['userModel'], 'findOne')
        .mockRejectedValueOnce(new Error('Mock error'));

      const result = await service.login(loginDto);

      expect(result.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toEqual('Mock error');
    });
  });
});
