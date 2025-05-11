import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReflectService } from './reflect.service';
import { Reflect, ReflectSchema } from './reflect.schema';
import { ReflectController } from './reflect.controller';
import { ReplyModule } from '../reply/reply.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reflect.name, schema: ReflectSchema }]),
    ReplyModule,
    UploadModule,
  ],
  controllers: [ReflectController],
  providers: [ReflectService],
  exports: [ReflectService],
})
export class ReflectModule {}
