import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone_number: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
