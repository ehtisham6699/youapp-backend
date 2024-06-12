import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiResponse } from 'src/utils/response.utils';
import { User } from '../models/user.schema';
import { ProfileDto } from '../dtos/profile.dto';
import { uploadInterceptor } from '../../shared/interceptors/fileUpload.interceptor';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseInterceptors(
    new uploadInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  @ApiBody({ type: ProfileDto })
  @UseGuards(AuthGuard('jwt'))
  updateProfile(
    @Body() ProfileDto: ProfileDto,
    @UploadedFiles() files,
    @Req() req: any,
  ): Promise<ApiResponse<User[]>> {
    const loggedInUser = req.user._id;
    return this.userService.updateProfile(loggedInUser, ProfileDto, files);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any): Promise<ApiResponse<User[]>> {
    const userId = req.user._id;
    return this.userService.getProfile(userId);
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Block/Unblock user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  blockOrUnblockUser(
    @Query('block') block: boolean,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const currentUser = req.user._id;
    return this.userService.blockOrUnblockUser(currentUser, userId, block);
  }
}
