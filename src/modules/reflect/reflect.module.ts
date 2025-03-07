import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { ReflectService } from './reflect.service';
import { Reflect, ReflectSchema } from './reflect.schema';
import { ReflectController } from './reflect.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reflect.name, schema: ReflectSchema }]),
  ],
  controllers: [ReflectController],
  providers: [ReflectService],
  exports: [ReflectService],
})
export class ReflectModule {}
