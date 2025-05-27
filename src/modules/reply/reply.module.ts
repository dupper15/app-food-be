import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reply, ReplySchema } from './reply.schema';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { RatingModule } from '../rating/rating.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reply.name, schema: ReplySchema }]),
    RatingModule,
    UploadModule,
  ],
  exports: [MongooseModule, ReplyService],
  controllers: [ReplyController],
  providers: [ReplyService],
})
export class ReplyModule {}
