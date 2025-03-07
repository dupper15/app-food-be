import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { Voucher, VoucherSchema } from './voucher.schema';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voucher.name, schema: VoucherSchema }]),
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
