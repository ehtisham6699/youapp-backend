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

  async getMessagesByConversation(
    conversationId: string,
    loggedInUser: string,
    page: number = 1,
    pageSize: number = 100,
  ): Promise<ApiResponse<{ conversation: Conversation; messages: Message[] }>> {
    try {
      const conversationObjectId = new Types.ObjectId(conversationId);
      const skip = (Number(page) - 1) * Number(pageSize);

      const result = await this.conversationModel
        .aggregate([
          {
            $match: {
              _id: conversationObjectId,
              participants: { $elemMatch: { userId: loggedInUser } },
            },
          },
          {
            $lookup: {
              from: 'messages',
              localField: '_id',
              foreignField: 'conversationId',
              as: 'messages',
              pipeline: [
                {
                  $unwind: {
                    path: '$seenBy',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'seenBy.user',
                    foreignField: '_id',
                    as: 'seenBy.user',
                    pipeline: [
                      {
                        $project: {
                          name: 1,
                          username: 1,
                          profileImage: { $ifNull: ['$profileImage', ''] },
                        },
                      },
                    ],
                  },
                },
                {
                  $unwind: {
                    path: '$seenBy.user',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $group: {
                    _id: '$_id',
                    seenBy: {
                      $push: {
                        $cond: {
                          if: { $ne: ['$seenBy.user._id', loggedInUser] },
                          then: '$seenBy',
                          else: '$$REMOVE', // Exclude the loggedInUser from seenBy
                        },
                      },
                    },
                    sender: { $first: '$sender' },
                    conversationId: { $first: '$conversationId' },
                    content: { $first: '$content' },
                    isPersonalMessage: { $first: '$isPersonalMessage' },
                    isDelivered: { $first: '$isDelivered' },
                    mediaLinks: { $first: '$mediaLinks' },
                    docLinks: { $first: '$docLinks' },
                    messageType: { $first: '$messageType' },
                    contactList: { $first: '$contactList' },
                    deletedBy: { $first: '$deletedBy' },
                    replyToMessage: { $first: '$replyToMessage' },
                  },
                },
                {
                  $lookup: {
                    from: 'messages',
                    localField: 'replyToMessage',
                    foreignField: '_id',
                    as: 'replyToMessage',
                  },
                },
                {
                  $unwind: {
                    path: '$replyToMessage',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: '$messages',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              'messages.deletedBy.user': {
                $ne: new Types.ObjectId(loggedInUser),
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'messages.sender',
              foreignField: '_id',
              as: 'messages.sender',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    username: 1,
                    profileImage: { $ifNull: ['$profileImage', ''] },
                  },
                },
              ],
            },
          },
          {
            $unwind: '$messages.sender',
          },
          {
            $sort: {
              'messages.createdAt': -1,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'participants.userId',
              foreignField: '_id',
              as: 'participants',
            },
          },
          {
            $group: {
              _id: '$_id',
              messages: { $push: '$messages' },
              totalMessages: { $sum: 1 },
              participants: { $first: '$participants' },
            },
          },
          {
            $addFields: {
              messages: {
                $slice: ['$messages', skip, Number(pageSize)],
              },
            },
          },
        ])
        .exec();
      console.log('sdsdsd', result);

      if (!result || result.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Conversation not found',
          data: null,
        };
      }

      let isUser2Blocked = false;
      const conversation = result[0];

      conversation.participants.forEach((participant) => {
        if (participant._id.toString() === loggedInUser) {
          let user2 = conversation.participants.filter(
            (user) => user._id !== participant._id,
          );
          if (
            participant.blockedUsers?.some(
              (blockedUser) =>
                blockedUser._id.toString() === user2[0]._id.toString(),
            )
          ) {
            isUser2Blocked = true;
          }
        }
      });

      if (isUser2Blocked) {
        conversation.messages = conversation.messages.filter(
          (message) =>
            message.isDelivered === true ||
            message.sender._id.toString() === loggedInUser,
        );
      }
      conversation.messages = conversation.messages.map((message) => {
        return {
          ...message,
          totalParticipants: conversation.participants.length,
        };
      });
      delete conversation.participants;

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Messages retrieved',
        data: {
          conversation: conversation,
        },
      };
    } catch (err) {
      console.log('errrrrrr', err);

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: err.message,
        data: null,
      };
    }
  }

  async updateManyMessagesSeenBy(userId, chatId) {
    try {
      const updatedMessages = await this.messageModel.find({
        conversationId: new Types.ObjectId(chatId),
        sender: { $ne: new Types.ObjectId(userId) },
        'seenBy.user': { $ne: new Types.ObjectId(userId) },
      });
      // Perform the update operation
      let newUpdatedMessages = [];
      for (const updateMessage of updatedMessages) {
        let s = await this.messageModel.findOneAndUpdate(
          {
            _id: updateMessage._id,
            sender: { $ne: new Types.ObjectId(userId) },
            seenBy: {
              $not: {
                $elemMatch: { user: new Types.ObjectId(userId) },
              },
            },
          },
          {
            $addToSet: { seenBy: { user: new Types.ObjectId(userId) } },
          },
          { new: true },
        );
        newUpdatedMessages.push(s);
      }
      return newUpdatedMessages;
    } catch (error) {
      console.error('Error updating messages:', error);
      throw error;
    }
  }
}
