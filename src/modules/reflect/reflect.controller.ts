import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ReflectService } from './reflect.service';
import { Reflect } from './reflect.schema';

@Controller('reflect')
export class ReflectController {
  constructor(private readonly reflectService: ReflectService) {}

  @Post('create')
  async createReflect(@Body() data: Partial<Reflect>): Promise<Reflect> {
    return this.reflectService.createReflect(data);
  }

  @Get('all')
  async fetchAllReflect(): Promise<Reflect[]> {
    return this.reflectService.fetchAllReflect();
  }

  @Get('customer/:id')
  async fetchReflectByCustomer(@Param('id') id: string): Promise<Reflect[]> {
    return this.reflectService.fetchReflectByCustomer(id);
  }

  @Post('reply/:id')
  async reply(
    @Param('id') id: string,
    @Body('message') message: string,
  ): Promise<Reflect> {
    return this.reflectService.reply(id, message);
  }
}
