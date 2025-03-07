import { IsOptional, IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class SendMessageDto {
  @IsMongoId()
  @IsOptional()
  _id: Types.ObjectId;

  @IsMongoId()
  sender_id: Types.ObjectId;

  @IsMongoId()
  receiver_id: Types.ObjectId;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  content: string;
}
