import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { timeStamp } from 'console';
import { Document } from 'mongoose';

@Schema({
  strict: false,
})
export class User extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  userId: string;

  @Prop({
    type: String,
  })
  MLUserID: string;

  @Prop({
    type: String,
  })
  MLToken: string;

  @Prop({
    type: String,
  })
  MLRefreshToken: string;

  @Prop({
    type: Date,
  })
  MLTokenTimestamp: Date;

  @Prop({
    type: Date,
  })
  MLRefreshTokenTimestamp: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
