import { Injectable } from '@nestjs/common';import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { SendNotificationDTO } from './dto/send-notification.dto';
import axios from 'axios';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    return this.notificationModel.create(data);
  }

  async sendPushNotification(expoPushToken: string, body: SendNotificationDTO) {
    try {
      if (!expoPushToken.startsWith('ExponentPushToken')) {
        throw new Error('Invalid Expo push token');
      }

      const message = {
        to: expoPushToken,
        sound: 'default',
        title: body.title,
        body: body.content,
      };

      const response = await axios.post(
        'https://exp.host/--/api/v2/push/send',
        message,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Expo push response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending push notification via Expo:', error);
      throw error;
    }
  }

  async changeStatus(id: string): Promise<Notification> {
    const updatedNotification = await this.notificationModel.findByIdAndUpdate(
      id,
      { isSeen: true },
      { new: true },
    );
    if (!updatedNotification) {
      throw new Error('Notification not found');
    }
    return updatedNotification;
  }

  async fetchAllNotificationsByUser(user_id: string): Promise<Notification[]> {
    return this.notificationModel.find({ user_id }).exec();
  }
}
