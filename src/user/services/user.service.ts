import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from 'src/chat/models/conversation.schema';
import { Message } from 'src/chat/models/message.schema';
import { User } from '../models/user.schema';
import { ApiResponse } from 'src/utils/response.utils';
import * as bcrypt from 'bcrypt';
import { ProfileDto } from '../dtos/profile.dto';
import * as sharp from 'sharp';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectModel('Conversation')
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async updateProfile(data?: ProfileDto, files?): Promise<ApiResponse<User>> {
    try {
      if (!data._id) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Missing User Id',
          data: null,
        };
      }

      const user = await this.userModel.findById(data._id).select('-password');
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          data: null,
        };
      }
      if (files && files.profileImage) {
        files['profileImage'] = [
          {
            ...files.profileImage[0],
            destination: './public/media/',
            buffer: await sharp(files.profileImage[0].path)
              .resize({ height: 200, width: 200 })
              .toBuffer(),
          },
        ];

        data.profileImage = `/media/${files.profileImage[0].filename}`;

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
      console.log(error);

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  async getProfile(userId: string): Promise<ApiResponse<User>> {
    console.log(userId);

    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          data: null,
        };
      }
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    };
  }

  async UpdateUser(data: ProfileDto) {
    let existingUser;
    let updatedUser = await this.userModel
      .findByIdAndUpdate(data._id, { $set: data }, { new: true })
      .select('-password')
      .exec();
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'User Updated Successfully',
      data: { user: updatedUser },
    };
  }

  async isBlockedByUser(
    senderId: string,
    recipientId: string,
  ): Promise<boolean> {
    const sender = await this.userModel.findById(senderId).exec();
    return sender.blockedUsers.some(
      (user) => user._id.toString() === recipientId && user.isBlocked,
    );
  }
}
