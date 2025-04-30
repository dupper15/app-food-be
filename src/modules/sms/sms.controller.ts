import { Controller, Post, Body, Put } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  async sendSms(@Body() body: { to: string; id: string }) {
    return this.smsService.sendSms(body.to, body.id);
  }
  @Post('verify')
  async verifyAccount(@Body() body: { id: string; code: number }) {
    return this.smsService.verifyAccount(body.id, body.code);
  }
  @Post('verify-no-delete-code')
  async verifyAccountNoDeleteCode(@Body() body: { id: string; code: number }) {
    return this.smsService.verifyAccountNoDeleteCode(body.id, body.code);
  }
  @Post('find-Id')
  async findId(@Body() body: { phone: string }) {
    return this.smsService.findId(body.phone);
  }
  @Put('forget-password')
  async forgetPassword(
    @Body()
    body: {
      id: string;
      code: number;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return this.smsService.forgetPassword(
      body.id,
      body.code,
      body.newPassword,
      body.confirmPassword,
    );
  }
}
