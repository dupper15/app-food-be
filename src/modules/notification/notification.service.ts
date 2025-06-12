import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import axios from 'axios';
import { Customer } from '../customer/customer.schema';
import { RestaurantOwner } from '../restaurant-owner/restaurant-owner.schema';

interface NotificationPayload {
  user_id: string;
  title: string;
  content: string;
  isSeen: boolean;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<Customer>,
    @InjectModel(RestaurantOwner.name)
    private restaurantOwnerModel: Model<RestaurantOwner>,
  ) {}

  async sendPushNotification(
    userId: string,
    orderId: string,
    title: string,
    content: string,
  ): Promise<any> {
    let existingUser: Customer | RestaurantOwner | null = null;
    const existingCustomer = await this.customerModel.findById(userId);
    if (existingCustomer) {
      existingUser = existingCustomer;
    } else {
      const existingRestaurantOwner =
        await this.restaurantOwnerModel.findById(userId);
      existingUser = existingRestaurantOwner;
    }
    const expoPushToken = existingUser?.expo_push_token;

    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
      console.warn(
        'Invalid or missing Expo push token for customer:',
        existingUser?._id,
      );
      return;
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body: content,
      data: { orderId },
    };

    try {
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

      await this.notificationModel.create({
        user_id: existingUser?._id,
        title,
        content,
        isSeen: false,
      });

      return response.data;
    } catch (error) {
      console.error('Error sending push notification:', error);
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

  async fetchAllNotificationsByUser(
    user_id: string | Types.ObjectId,
  ): Promise<Notification[]> {
    // Convert string to ObjectId if needed
    const userId =
      typeof user_id === 'string' ? new Types.ObjectId(user_id) : user_id;
    return this.notificationModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async createNotification(data: {
    title: string;
    content: string;
  }): Promise<any> {
    const [customers, restaurantOwners] = await Promise.all([
      this.customerModel.find({}, '_id expo_push_token'),
      this.restaurantOwnerModel.find({}, '_id expo_push_token'),
    ]);

    const allUsers = [...customers, ...restaurantOwners];
    const notifications: NotificationPayload[] = [];

    for (const user of allUsers) {
      const { _id, expo_push_token } = user;
      if (expo_push_token && expo_push_token.startsWith('ExponentPushToken')) {
        const message = {
          to: expo_push_token,
          sound: 'default',
          title: data.title,
          body: data.content,
          data: {},
        };

        try {
          await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn(`Failed to send push to user ${String(_id)}:`, error);
        }
      }
      notifications.push({
        user_id: String(_id),
        title: data.title,
        content: data.content,
        isSeen: false,
      });
    }
    return {
      message: `Đã gửi thông báo đến ${allUsers.length} người dùng.`,
    };
  }
}
