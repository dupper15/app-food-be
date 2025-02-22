import { IUser } from '../user/user.interface';

export interface ICustomer extends IUser {
  address: string;
}
