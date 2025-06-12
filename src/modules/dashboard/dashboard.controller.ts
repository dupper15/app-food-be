import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('')
  async getAll() {
    return this.dashboardService.getAll();
  }
  @Get('monthly-order')
  async getMonthOrder() {
    return this.dashboardService.getMonthOrder();
  }
  @Get('monthly-dish')
  async getMonthDish() {
    return this.dashboardService.getMonthDish();
  }
  @Get('top-restaurant')
  async getTopTenRestaurant(
    @Query('filter') filter: string = 'order',
    @Query('sortBy') sortBy: string = 'desc',
  ) {
    return this.dashboardService.getTopTenRestaurant(filter, sortBy);
  }
  @Get('top-user')
  async getTopTenUser(
    @Query('filter') filter: string = 'login',
    @Query('sortBy') sortBy: string = 'desc',
  ) {
    return this.dashboardService.getTopTenUser(filter, sortBy);
  }
  @Get('top-dish')
  async getTopTenDish() {
    return this.dashboardService.getTopTenDish();
  }
  @Get('pie-chart')
  async getPieChartOder() {
    return this.dashboardService.getPieChartOrder();
  }
  @Get('pie-chart-product')
  async getPieChartProductSale(@Query('filter') filter: string = 'today') {
    return this.dashboardService.getPieChartProductSale(filter);
  }
  @Get('total-dish')
  async getTotalDish() {
    return this.dashboardService.getTotalDish();
  }
}
