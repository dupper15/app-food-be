import { Controller, Post, Get, Param, Body } from '@nestjs/common';import { HistoryService } from './history.service';
import { History } from './history.schema';
import { CreateHistoryDto } from './dto/createHistory';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('create')
  async createHistory(
    @Body() createHistoryDto: CreateHistoryDto,
  ): Promise<History> {
    return this.historyService.createHistory(createHistoryDto);
  }

  @Get('customer/:customerId')
  async fetchAllHistoryByCustomer(
    @Param('customerId') customerId: string,
  ): Promise<History[]> {
    return this.historyService.fetchAllHistoryByCustomer(customerId);
  }

  @Get('detail/:id')
  async fetchDetailHistoryByCustomer(
    @Param('id') id: string,
  ): Promise<History> {
    return this.historyService.fetchDetailHistoryByCustomer(id);
  }
}
