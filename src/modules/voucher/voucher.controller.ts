import { Controller, Post, Get, Param, Body } from '@nestjs/common';import { VoucherService } from './voucher.service';
import { Voucher } from './voucher.schema';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  // @Post('create')
  // async createVoucher(@Body() data: Partial<Voucher>): Promise<Voucher> {
  //   return this.voucherService.createVoucher(data);
  // }

  // @Get('system')
  // async fetchSystemVouchers(): Promise<Voucher[]> {
  //   return this.voucherService.fetchSystemVouchers();
  // }

  // @Get('available/:restaurantId')
  // async fetchAvailableVouchers(
  //   @Param('restaurantId') restaurantId: string,
  // ): Promise<Voucher[]> {
  //   return this.voucherService.fetchAvailableVouchers(restaurantId);
  // }

  // @Get('detail/:id')
  // async getDetailVoucher(@Param('id') id: string): Promise<Voucher> {
  //   return this.voucherService.getVoucherById(id);
  // }
}
