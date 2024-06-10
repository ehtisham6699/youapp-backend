import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [
      {
        type: {
          userId: { type: Types.ObjectId, ref: 'User' },
          hasMuted: { type: Boolean, default: false },
          hasUnread: { type: Boolean, default: false },
          isPinned: { type: Boolean, default: false },
        },
      },
    ],
    _id: false,
  })
  participants: {
    userId: Types.ObjectId;
    hasMuted: boolean;
    hasUnread: boolean;
    isPinned: boolean;
  }[];

  @Prop({ default: false })
  isGroupChat: boolean;

  @Prop()
  groupName: string;

  @Prop({ default: '' })
  groupImage: string;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
  })
  admins: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({
    type: [
      {
        type: {
          userId: { type: Types.ObjectId, ref: 'User' },
          deletedAt: { type: Date, default: Date() },
          status: { type: Boolean, default: false },
        },
      },
    ],
    _id: false,
  })
  deletedBy: {
    userId: Types.ObjectId;
    deletedAt: Date;
    status: boolean;
  }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
