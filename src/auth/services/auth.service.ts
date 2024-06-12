import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/models/user.schema';
import { RegistrationDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/utils/response.utils';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async verifyToken(token): Promise<any> {
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
      const newUser = await this.userModel.create({
        email,
        username,
        password: hashedPassword,
      });

      // Generate JWT token
      const payload = { username: newUser.username, sub: newUser._id };
      const token = this.jwtService.sign(payload);
      console.log(newUser);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: newUser,
      };
    } catch (error) {
      console.log('Error registering user:', error); // Log the error
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error registering user',
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
      const accessToken = this.jwtService.sign({
        userId: user._id,
        email: user.email,
      });

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

  async validateUser(_id: string): Promise<User | undefined> {
    return this.userModel.findOne({ _id }).select('id email username').exec();
  }
}
