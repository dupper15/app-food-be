import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: false, required: false })
  isDeleted: boolean;

  @Prop({ required: false })
  image: string;
}
export const CategorySchema = SchemaFactory.createForClass(Category);
