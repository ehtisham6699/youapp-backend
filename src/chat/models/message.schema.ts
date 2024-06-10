import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

enum MessageType {
  Text = 'text',
  Media = 'media',
  File = 'file',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversationId: Types.ObjectId;

  @Prop({ default: '' })
  content: string;

  @Prop({ default: true })
  isPersonalMessage: Boolean;

  @Prop({ default: false })
  isDelivered: Boolean;

  @Prop({
    type: [
      {
        type: {
          path: { type: String },
          mime: { type: String },
        },
      },
    ],
    _id: false,
  })
  mediaLinks: [path: string, mime: string];

  @Prop()
  docLinks: [];

  @Prop({ enum: MessageType, default: MessageType.Text })
  messageType: string;

  @Prop({ default: '' })
  mediaId: string;

  @Prop()
  contactList: [];

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    _id: false,
  })
  deletedBy: { user: Types.ObjectId; timestamp: Date }[];

  @Prop({
    type: [
      {
        type: {
          user: { type: Types.ObjectId, ref: 'User' },
          timestamp: { type: Date, default: Date.now },
        },
      },
    ],
    _id: false,
  })
  seenBy: { user: Types.ObjectId; timestamp: Date }[];

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  replyToMessage: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
