import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Rating {}
export const RatingSchema = SchemaFactory.createForClass(Rating);
