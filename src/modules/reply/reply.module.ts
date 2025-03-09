import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reply, ReplySchema } from './reply.schema';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reply.name, schema: ReplySchema }]),
  ],
  exports: [MongooseModule, ReplyService],
  controllers: [ReplyController],
  providers: [ReplyService],
})
export class ReplyModule {}
