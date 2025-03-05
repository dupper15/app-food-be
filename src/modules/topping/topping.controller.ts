import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ToppingService } from './topping.service';
import { AddToppingDto } from './dto/addTopping.dto';
import { EditToppingDto } from './dto/editTopping.dto';
import { Types } from 'mongoose';

@Controller('toppings')
export class ToppingController {
  constructor(private readonly toppingServive: ToppingService) {}

  @Post('add')
  @UsePipes(new ValidationPipe())
  async addToppingController(@Body() addToppingDto: AddToppingDto) {
    return await this.toppingServive.addTopping(addToppingDto);
  }

  @Put('edit/:id')
  @UsePipes(new ValidationPipe())
  async editToppingController(
    @Body() editToppingDto: EditToppingDto,
    @Param('id') id: string,
  ) {
    const topping_id = new Types.ObjectId(id);
    return await this.toppingServive.editTopping(topping_id, editToppingDto);
  }

  @Delete('delete/:id')
  async deleteToppingController(@Param('id') id: string) {
    const topping_id = new Types.ObjectId(id);
    return await this.toppingServive.deleteTopping(topping_id);
  }
}
