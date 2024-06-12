import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Conversation } from 'src/chat/models/conversation.schema';
import { Message } from 'src/chat/models/message.schema';
import { User } from '../models/user.schema';
import { ApiResponse } from 'src/utils/response.utils';
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

  async updateProfile(
    userId,
    data?: ProfileDto,
    files?,
  ): Promise<ApiResponse<User>> {
    try {
      if (!userId) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Missing User Id',
          data: null,
        };
      }

      const user = await this.userModel
        .findById(userId.toString())
        .select('-password');

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

  async UpdateUser(data) {
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

  async blockOrUnblockUser(currentUser, userId, block) {
    try {
      // Find the current user
      const user = await this.userModel
        .findById(new mongoose.Types.ObjectId(currentUser))
        .exec();

      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not Found',
          data: { user },
        };
      }

      // Check if the user is already blocked
      const blockedUserIndex = user.blockedUsers.findIndex(
        (blockedUser) => blockedUser._id.toString() === userId,
      );
      if (blockedUserIndex === -1 && block === true) {
        // If blocking, add the user to the blockedUsers array
        user.blockedUsers.push({
          _id: new mongoose.Types.ObjectId(userId),
          isBlocked: true,
          timestamp: new Date(),
        });
      } else {
        // If unblocking, set the isBlocked field to false
        if (blockedUserIndex !== -1) {
          user.blockedUsers[blockedUserIndex].isBlocked = block === true;
          user.blockedUsers[blockedUserIndex].timestamp = new Date();
        }
      }
      // Save the updated user
      await user.save();

      return {
        statusCode: HttpStatus.ACCEPTED,
        message:
          block === true
            ? 'User blocked successfully'
            : 'User unblocked successfully',
        data: { user },
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
