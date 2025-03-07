import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/createDish.dto';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createDishController(@Body() createDishDto: CreateDishDto) {
    return await this.dishService.createDish(createDishDto);
  }
}
