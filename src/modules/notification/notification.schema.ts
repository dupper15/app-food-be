import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Notification {}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
