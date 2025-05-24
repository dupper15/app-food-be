import { IsString } from 'class-validator';
export class SendNotificationDTO {
  @IsString()
  title: string;

  @IsString()
  content: string;

  user_id: string;

  data?: Record<string, any>;
}
