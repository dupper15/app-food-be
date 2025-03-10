import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    return this.notificationModel.create(data);
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
