import { Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Reflect {}
export const ReflectSchema = SchemaFactory.createForClass(Reflect);
