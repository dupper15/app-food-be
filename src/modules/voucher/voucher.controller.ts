import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { Voucher } from './voucher.schema';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { EditVoucherDto } from './dto/edit-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('create')
  async createVoucher(@Body() data: CreateVoucherDto): Promise<Voucher> {
    return this.voucherService.createVoucher(data);
  }

  @Put('edit/:id')
  async editVoucher(
    @Param('id') id: string,
    @Body() data: EditVoucherDto,
  ): Promise<Voucher | null> {
    return this.voucherService.editVoucher(id, data);
  }

  @Delete('delete/:id')
  async deleteVoucher(@Param('id') id: string): Promise<Voucher | null> {
    return this.voucherService.deleteVoucher(id);
  }

  @Get('system')
  async fetchSystemVouchers(): Promise<Voucher[]> {
    return this.voucherService.fetchSystemVouchers();
  }

  @Get('available/:restaurantId')
  async fetchAvailableVouchers(
    @Param('restaurantId') restaurantId: string,
  ): Promise<Voucher[]> {
    return this.voucherService.fetchAvailableVouchers(restaurantId);
  }

  @Get('all-voucher/:restaurantId')
  async fetchAllVouchers(
    @Param('restaurantId') restaurantId: string,
  ): Promise<Voucher[]> {
    return this.voucherService.fetchAllVoucher(restaurantId);
  }

  @Get('detail/:id')
  async getDetailVoucher(@Param('id') id: string): Promise<Voucher> {
    return this.voucherService.getVoucherById(id);
  }

  @Post('detail-array')
  async getDetailVoucherArray(@Body() idArray: string[]): Promise<Voucher[]> {
    return Promise.all(
      idArray.map(async (id) => {
        return this.voucherService.getVoucherById(id);
      }),
    );
  }
}
