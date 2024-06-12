import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegistrationDto } from '../dtos/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../dtos/login.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registrationData: RegistrationDto) {
    return await this.authService.registerUser(registrationData);
  }

  @Post('login')
  async loginUser(@Body() loginData: LoginDto) {
    return await this.authService.login(loginData);
  }
}
