import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from 'src/chat/models/conversation.schema';
import { Message } from 'src/chat/models/message.schema';
import { User } from '../models/user.schema';
import { ApiResponse } from 'src/utils/response.utils';
import * as bcrypt from 'bcrypt';
import { ProfileDto } from '../dtos/profile.dto';
import sharp from 'sharp';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Message') private readonly messageModel: Model<Message>,
        @InjectModel('Conversation')
        private readonly conversationModel: Model<Conversation>,
      ) {}
      async updateProfile(
        data?: ProfileDto,
        files?,
      ): Promise<ApiResponse<User>> {
        try {
          if (!data._id) {
            return {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'Missing User Id',
              data: null,
            };
          }
    
          const user = await this.userModel.findById(data._id);
          if (!user) {
            return {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'User not found',
              data: null,
            };
          }
    
          if (files && files.profileImage) {
            const profileImagePath = `./public/media/${files.profileImage[0].filename}`;
            await sharp(files.profileImage[0].path)
              .resize({ height: 200, width: 200 })
              .toFile(profileImagePath);
    
            data.profileImage = `/media/${files.profileImage[0].filename}`;
            // If you have S3 integration, uncomment and implement the moveFilesToS3 function
            // await moveFilesToS3(profileImagePath, files);
          }
    
          // Update user fields
          Object.assign(user, data);
          await user.save();
    
          return {
            statusCode: HttpStatus.OK,
            message: 'Profile updated successfully',
            data: user,
          };
        } catch (error) {
          return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: null,
          };
        }
      }
}
