import { IsNotEmpty, IsString } from 'class-validator';
export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
