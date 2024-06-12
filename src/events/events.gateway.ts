import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { IncomingHttpHeaders } from 'http';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/services/auth.service';
import { MessageService } from 'src/chat/services/message.service';
import { ConversationService } from 'src/chat/services/conversation.service';
import { Types } from 'mongoose';
import { UserService } from 'src/user/services/user.service';
import { CreateMessageDto } from './event_message.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  socket: Socket;

  constructor(
    private readonly authService: AuthService,
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}
  private userSockets = new Map<string, Socket>();
  private connectedUsers = new Map<string, boolean>();

  private updateUserStatus(userId: string, isOnline: boolean): void {
    this.connectedUsers.set(userId, isOnline);
  }

  // Method to get user's online status
  private getUserStatus(userId: string): boolean | undefined {
    return this.connectedUsers.get(userId);
  }

  async handleConnection(client: Socket) {
    console.log(Socket);
    try {
      this.socket = client;
      const headers: IncomingHttpHeaders = client.handshake.headers;
      if (process.env.NODE_ENV === 'production') {
        //
      } else {
        let token = headers.token;
        if (!token) {
          throw new UnauthorizedException('Missing token');
        }
        const isValid = await this.authService.verifyToken(token);
        if (isValid) {
          const userInfo = await this.authService.validateUser(isValid.userId);

          // @ts-ignore
          const userId = userInfo._id.toString();
          client.data.userId = userId;
          const conversationId =
            await this.conversationService.getConversationIdsOfUser(userId);
          this.userSockets.set(userId, client);
          this.updateUserStatus(userId, true);
          console.log('User connected', userId);
          client.join(userId);
          // Emit event to notify other users about online status
          this.server.emit('status', {
            userId: userId,
            status: true,
          });
          if (conversationId) {
            conversationId.forEach((e) => {
              client.join(e.conversationId);
            });
          }
        }
      }
    } catch (e) {
      console.log(e);

      client.emit('authError', { message: 'Authentication failed' });
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId?.toString();
    let onlineStatus = this.getUserStatus(userId);
    console.log('user disconnected', userId);

    // Set user status to offline upon disconnection
    this.updateUserStatus(userId, false);

    const lastSeenDate = new Date(); // Get current date/time
    let lastseen = await this.userService.UpdateUser({
      _id: userId,
      lastSeen: lastSeenDate,
    });
    this.server.emit('status', {
      userId: userId,
      status: false,
      lastSeen: lastseen?.data?.user?.lastSeen,
    });
    client.disconnect();
  }

  @SubscribeMessage('send_message')
  @ApiResponse({ status: 200, description: 'Received message successfully' })
  async createChat(client: Socket, data: any) {
    try {
      const userId = client.data.userId.toString();
      const conversationId = data.conversationId;
      const senderId = new Types.ObjectId(userId);
      //const encryptedContent = encryptMessage(data.content);
      const conversation =
        await this.conversationService.getConversationById(conversationId);

      if (!conversation) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Conversation not found',
          data: null,
        };
      }
      const messageDto: CreateMessageDto = {
        sender: senderId,
        conversationId: conversationId,
        content: data.content,
        mediaLinks: data.mediaLinks || [],
        docLinks: data.docLinks || [],
        mediaId: data.mediaId || '',
        isDelivered: false,
        isMedia: data.isMedia || false,
        messageType: data.messageType || 'text',
        replyToMessage: data.replyToMessage || null,
      };
      let newMessage;
      ////////////////////execution for private chat//////////////////////////////////
      if (!conversation.isGroupChat && conversation.participants) {
        const recipientId = conversation.participants.find(
          (participant) => !participant.userId.equals(senderId),
        );

        // Check if the sender has blocked the recipient
        const isBlockedBySender = await this.userService.isBlockedByUser(
          senderId.toString(),
          recipientId.userId.toString(),
        );
        const isBlockedByRecipient = await this.userService.isBlockedByUser(
          recipientId.userId.toString(),
          senderId.toString(),
        );
        // console.log('blocked by sender ', isBlockedBySender);
        // console.log('blocked by receipient ', isBlockedByRecipient);

        if (isBlockedBySender) {
          client.emit('error', { message: 'user is blocked' });
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'You cannot send message to blocked user',
            data: null,
          };
        } else if (isBlockedByRecipient) {
          Object.assign(messageDto, { isDelivered: false });
          const newMessage =
            await this.messageService.createMessage(messageDto);
          client.emit('message_sent', {
            ...newMessage.data.message,
            totalparticipants: conversation.participants.length,
          });
        } else {
          /////////////////////check for online user for message delivered/////////////////////////////////////
          let onlineUser = this.getUserStatus(recipientId.userId.toString());
          if (onlineUser) {
            messageDto.isDelivered = true;
          }
          newMessage = await this.messageService.createMessage(messageDto);
          try {
            client.emit('message_sent', {
              ...newMessage.data.message,
              totalparticipants: conversation.participants.length,
            });
          } catch (err) {
            console.log('error on message sent on private chat', err);
          }
        }

        const unseenCount =
          await this.conversationService.getConversationUnreadCount(
            conversationId.toString(),
            recipientId.userId.toString(),
          );
        console.log(unseenCount);

        client.broadcast
          .to(recipientId.userId.toString())
          .emit('unread_message_count', {
            unseenCount,
          });
        try {
          client.broadcast
            .to(recipientId.userId._id.toString())
            .emit('receive', {
              ...newMessage?.data?.message,

              content: newMessage?.data?.message?.content,
            });
        } catch (err) {}
      } else {
        ////////////////////execution for group chat//////////////////////////////////
        let newMessage;

        newMessage = await this.messageService.createMessage(messageDto);
        client.emit('message_sent', {
          ...newMessage?.data?.message,
          totalParticipants: conversation.participants.length,
        });
        const recipientIds = conversation.participants
          .filter((participant) => !participant.userId.equals(senderId))
          .map((participant) => participant.userId);
        let unseenCount;
        recipientIds.forEach(async (receiver) => {
          unseenCount =
            await this.conversationService.getConversationUnreadCount(
              conversationId.toString(),
              receiver.toString(),
            );
          client.broadcast
            .to(receiver.toString())
            .emit('unread_message_count', {
              unseenCount,
            });
        });
        try {
          let res = await client.broadcast.to(conversationId).emit('receive', {
            ...newMessage?.data?.message,
            content: newMessage?.data?.message?.content,
            totalParticipants: conversation.participants.length,
          });
        } catch (err) {
          console.log('error in group acknowlegment', err);
        }
      }
    } catch (err) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: err.message,
        data: null,
      };
    }
  }

  @SubscribeMessage('conversation_opened')
  async markConversationRead(client: Socket, data: any) {
    const userId = client.data.userId.toString();
    const conversationId = data.conversationId;
    const conversationClicked = data.conversationClicked;
    let updatedMessages = await this.messageService.updateManyMessagesSeenBy(
      userId,
      conversationId,
    );
    if (conversationClicked) {
      client.to(conversationId).emit('checkmark', updatedMessages);
    }
  }
}
