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
import { ObjectId } from 'mongoose';

@Controller('toppings')
export class ToppingController {
  constructor(private readonly toppingService: ToppingService) {}

  @Post('add')
  @UsePipes(new ValidationPipe())
  async addToppingController(@Body() addToppingDto: AddToppingDto) {
    return await this.toppingService.addTopping(addToppingDto);
  }

  @Put('edit/:id')
  @UsePipes(new ValidationPipe())
  async editToppingController(
    @Body() editToppingDto: EditToppingDto,
    @Param('id') id: ObjectId,
  ) {
    return await this.toppingService.editTopping(id, editToppingDto);
  }

  @Delete('delete/:id')
  async deleteToppingController(@Param('id') id: ObjectId) {
    return await this.toppingService.deleteTopping(id);
  }
}
