import { Body, Controller, Patch, UploadedFiles } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiResponse } from 'src/utils/response.utils';
import { User } from '../models/user.schema';
import { ProfileDto } from '../dtos/profile.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Patch('/profile')
    updateProfile(
      @Body() ProfileDto: ProfileDto,
      @UploadedFiles() files,
    ): Promise<ApiResponse<User[]>> {
      return this.userService.updateProfile(ProfileDto, files);
    }

}
