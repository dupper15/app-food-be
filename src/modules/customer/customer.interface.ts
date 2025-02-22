import { IUser } from '../user/user.interface';
export interface ICustomer extends IUser {
  address: string;
  verified_code: number;
  code_expired: Date;
  status: string;
}
