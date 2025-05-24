import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.schema';
import { SendNotificationDTO } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('create')
  async createNotification(
    @Body() data: Partial<Notification>,
  ): Promise<Notification> {
    return this.notificationService.createNotification(data);
  }

  @Post('change-status/:id')
  async changeStatus(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.changeStatus(id);
  }

  @Get('user/:id')
  async fetchAllByUser(@Param('id') id: string): Promise<Notification[]> {
    return this.notificationService.fetchAllNotificationsByUser(id);
  }

  @Post('send/:id')
  async sendNotification(
    @Param('id') userId: string,
    @Body() body: SendNotificationDTO,
  ) {
    return this.notificationService.sendPushNotification(userId, body);
  }
}
