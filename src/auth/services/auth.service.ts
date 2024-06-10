import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/models/user.schema';
import { RegistrationDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/utils/response.utils';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async verifyToken(token: string): Promise<any> {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  async registerUser(
    registrationDto: RegistrationDto,
  ): Promise<ApiResponse<User>> {
    const { email, username, password, confirmPassword } = registrationDto;

    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Passwords do not match',
          data: null,
        };
      }

      // Check if the user already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already in use',
          data: null,
        };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new this.userModel({
        email,
        username,
        password: hashedPassword,
      });

      // Save the user to the database
      await newUser.save();

      // Generate JWT token
      const payload = { username: newUser.username, sub: newUser._id };
      const token = this.jwtService.sign(payload);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: newUser,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  async login(data: LoginDto): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const user = await this.userModel.findOne({ email: data.email });
      if (!user) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
          data: null,
        };
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
          data: null,
        };
      }

      const payload = { userId: user._id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: { accessToken },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userModel.findById(id).exec();
  }
}
