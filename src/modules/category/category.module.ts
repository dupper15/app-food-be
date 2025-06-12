import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { DishModule } from '../dish/dish.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
    RestaurantModule,
    DishModule,
    UploadModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryModule],
})
export class CategoryModule {}
