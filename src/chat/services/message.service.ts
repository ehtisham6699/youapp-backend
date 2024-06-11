import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Conversation } from '../models/conversation.schema';
import { Message } from '../models/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ChatGateway } from 'src/events/events.gateway';
import { Model, Types } from 'mongoose';
import { MessageDto } from '../dtos/message.dto';
import { ApiResponse } from 'src/utils/response.utils';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectModel('Conversation')
    private readonly conversationModel: Model<Conversation>,
    // @Inject(forwardRef(() => NotificationService))
    // private readonly notificationservice: NotificationService,
  ) {}

  async createMessage(messageDto: MessageDto): Promise<ApiResponse<Message[]>> {
    try {
      messageDto.sender = new Types.ObjectId(messageDto.sender);
      messageDto.conversationId = new Types.ObjectId(messageDto.conversationId);
      if (messageDto.replyToMessage !== null) {
        messageDto.replyToMessage = new Types.ObjectId(
          messageDto.replyToMessage,
        );
      }

      const newMessage = new this.messageModel(messageDto);
      await newMessage.save();

      const saveMessage = await this.messageModel.aggregate([
        {
          $match: { _id: newMessage._id },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'sender',
            foreignField: '_id',
            as: 'sender',
          },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'replyToMessage',
            foreignField: '_id',
            as: 'replyToMessage',
            let: { senderId: '$sender' },
            pipeline: [
              {
                $addFields: {
                  senderId: '$sender',
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'senderId',
                  foreignField: '_id',
                  as: 'sender',
                },
              },
              {
                $addFields: {
                  sender: { $arrayElemAt: ['$sender', 0] },
                },
              },
              {
                $project: {
                  senderId: 0, // Exclude senderId field from the output
                  'sender.passcode': 0,
                  'sender.publicKey': 0,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            sender: { $arrayElemAt: ['$sender', 0] },
            replyToMessage: { $arrayElemAt: ['$replyToMessage', 0] },
          },
        },
        {
          $project: {
            'sender.password': 0,
            'sender.publicKey': 0,
            'sender.blockedUsers': 0,
            'sender.interests': 0,
          },
        },
      ]);
      let chat = await this.conversationModel.findById(
        messageDto.conversationId,
      );

      if (chat) {
        const userIds = chat.participants
          .filter(
            (user) =>
              user.userId.toString() !== messageDto.sender.toString() &&
              !user.hasMuted,
          )
          .map((user) => user.userId.toString());
        // if (userIds.length > 0) {
        //   await this.notificationservice.sendPushNotification(
        //     newMessage.content,
        //     userIds,
        //   );
        // }
      }
      return {
        statusCode: HttpStatus.CREATED,
        message: 'New Message Created',
        data: { message: saveMessage[0] },
      };
    } catch (err) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: err.message,
        data: [],
      };
    }
  }
}
