import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiResponse } from 'src/utils/response.utils';
import { User } from '../models/user.schema';
import { ProfileDto } from '../dtos/profile.dto';
import { uploadInterceptor } from 'src/shared/interceptors/fileUpload.interceptor';
import { AuthGuard } from '@nestjs/passport';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  @UseInterceptors(
    new uploadInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  updateProfile(
    @Body() ProfileDto: ProfileDto,
    @UploadedFiles() files,
  ): Promise<ApiResponse<User[]>> {
    return this.userService.updateProfile(ProfileDto, files);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any): Promise<ApiResponse<User[]>> {
    const userId = req.user._id;
    return this.userService.getProfile(userId);
  }
}
