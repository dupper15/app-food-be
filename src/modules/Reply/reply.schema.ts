import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Reply {}
export const ReplySchema = SchemaFactory.createForClass(Reply);
