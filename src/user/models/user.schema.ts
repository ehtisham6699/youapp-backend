import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId, Types } from 'mongoose';
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, ref: 'User' },
        isBlocked: { type: Boolean, default: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  })
  blockedUsers: {
    _id: Types.ObjectId;
    isBlocked: boolean;
    timestamp: Date;
  }[];

  phoneNumber: string;

  @Prop({ lastSeen: { type: Date, default: Date.now } })
  lastSeen: Date;

  @Prop({ lastSeen: { type: Date } })
  birthDay: Date;

  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop()
  Gender: string;

  @Prop()
  horoscope: string;

  @Prop()
  zodiac: string;
  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop({ type: [String] })
  interests?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
