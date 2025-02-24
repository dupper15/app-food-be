import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email: string, code: number): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${code}. This code will expire in one minute.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
