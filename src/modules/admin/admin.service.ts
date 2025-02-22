import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Admin,
  ) {}
}
