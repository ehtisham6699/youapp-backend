import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from '../models/conversation.schema';
import mongoose, { Model, Types } from 'mongoose';
import { ConversationDto } from '../dtos/conversation.dto';
import { Message } from '../models/message.schema';
import { MessageDto } from '../dtos/message.dto';
import * as sharp from 'sharp';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel('Conversation')
    private readonly conversationModel: Model<Conversation>,
    @InjectModel('Message')
    private readonly messageModel: Model<Message>,
  ) {}

  async createSingleConversation(chatData) {
    const {
      participants,
      isGroupChat,
      groupName,
      admins,
      firstMessage,
      messageType,
      createdBy,
    } = chatData;
    const newParticipants = participants.map((id) => new Types.ObjectId(id));
    const newCreatedBy = new Types.ObjectId(createdBy);
    if (participants.length !== 2) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'A single chat conversation can only have two participants',
        data: null,
      };
    }
    const existingConversation = await this.conversationModel.findOne({
      'participants.userId': { $all: newParticipants },
      isGroupChat: false,
    });
    if (existingConversation) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Single chat already exists between these participants',
        data: null,
      };
    }

    let chat = new this.conversationModel({
      participants: newParticipants.map((participant) => {
        return { userId: participant };
      }),
      isGroupChat: false,
      groupName,
      admins,
      createdBy: newCreatedBy,
    });
    await chat.populate({
      path: 'participants.userId',
      select: 'name username profileImage',
    });
    await chat.save();

    let message = {
      conversationId: chat._id,
      sender: chat.createdBy,
      content: firstMessage,
      replyToMessage: null,
    };
    let newMessage;
    let messages = [];
    if (messageType !== 'media') {
      newMessage = new this.messageModel(message);
      await newMessage.populate('sender', 'name username profileImage');
      await newMessage.save();
      messages = [newMessage];
    }
    const userIds = participants.filter(
      (user) => user.toString() !== message.sender.toString(),
    );
    // if (userIds.length > 0) {
    //   await this.notificationservice.sendPushNotification(
    //     newMessage?.content || 'media',
    //     userIds,
    //   );
    // }
    ///we are using hardcoded values bcz intitially these filter will be false
    let userfilters = {
      hasMuted: false,
      hasUnread: false,
      isPinned: false,
    };
    // this.chatGateway.emitToConversation(
    //   chat._id.toString(),
    //   'new_chat_created',
    //   {
    //     chat: {
    //       ...chat.toObject(),
    //       messages,
    //       ...userfilters,
    //       sender: chat.createdBy,
    //     },
    //   },
    // );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Private Conversation Created',
      data: { chat: { ...chat.toObject(), messages } },
    };
  }

  async createConversation(conversationDto: ConversationDto): Promise<any> {
    console.log(conversationDto);

    try {
      const conversation = new this.conversationModel(conversationDto);
      await conversation.save();
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Conversation created successfully',
        data: conversation,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create conversation',
        error: error.message,
      };
    }
  }

  async createGroupConversation(chatData, files) {
    const { participants, isGroupChat, groupName, admins, createdBy } =
      chatData;
    console.log(chatData);

    const newParticipants = participants.map((id) => ({
      userId: new Types.ObjectId(id),
    }));
    const newAdmins = admins.map((id) => new Types.ObjectId(id));
    const newCreatedBy = new Types.ObjectId(createdBy);
    if (files && files.groupImage) {
      console.log(files);

      files['groupImage'] = [
        {
          ...files.groupImage[0],
          destination: './public/media/',
          buffer: await sharp(files.groupImage[0].path)
            .resize({ height: 200, width: 200 })
            .toBuffer(),
        },
      ];
      chatData.groupImage = '/media/' + files.groupImage[0].filename;
      //   moveFilesToS3('public/media/', files);
    }
    let groupImage = chatData.groupImage;
    // Create a new user document

    // Other user-related fields

    const chat = new this.conversationModel({
      participants: newParticipants,
      isGroupChat: true,
      groupName,
      admins: newAdmins,
      createdBy: newCreatedBy,
      ...(groupImage !== undefined ? { groupImage } : {}),
    });
    await chat.populate([
      {
        path: 'participants.userId',
        select: 'username name profileImage',
      },
      {
        path: 'admins',
        select: 'username name profileImage',
      },
    ]);
    await chat.save();

    // const userIds = participants.filter(
    //   (user) => user.toString() !== message.sender.toString(),
    // );
    // if (userIds.length > 0) {
    //   await this.notificationservice.sendPushNotification(
    //     'You have been added to a new group',
    //     userIds,
    //   );
    // }

    ///we are using hardcoded values because intitially these filter will be false
    let userfilters = {
      hasMuted: false,
      hasUnread: false,
      isPinned: false,
    };

    // this.chatGateway.emitToConversation(
    //   chat._id.toString(),
    //   'new_chat_created',
    //   { chat: { ...chat.toObject(), ...userfilters } },
    // );
    return {
      statusCode: HttpStatus.CREATED,
      message: ' Group Conversation Created',
      data: chat,
    };
  }

  async getConversationById(conversationId: string) {
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
    });
    return conversation;
  }

  async getConversationUnreadCount(conversationId, userId) {
    conversationId = new Types.ObjectId(conversationId);
    userId = new Types.ObjectId(userId);

    const conversation = await this.conversationModel.aggregate([
      {
        $match: {
          _id: conversationId,
          'participants.userId': userId,
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
              $match: {
                $and: [
                  { sender: { $ne: userId } },
                  { seenBy: { $not: { $elemMatch: { user: userId } } } },
                ],
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          conversationId: '$_id',
          unseenCount: {
            $size: '$messages',
          },
        },
      },
    ]);

    return conversation.length > 0 ? conversation[0] : {};
  }

  async getConversationIdsOfUser(userId) {
    try {
      const userConversations = await this.conversationModel
        .find({
          'participants.userId': new Types.ObjectId(userId),
        })
        .select('_id participants');

      const conversationIds = userConversations.map((conversation) => ({
        conversationId: conversation._id.toString(),
        participants: conversation.participants.map((participant) =>
          participant.userId.toString(),
        ),
      }));

      return conversationIds;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
