import { Module } from '@nestjs/common';import { MongooseModule } from '@nestjs/mongoose';
import { Reply, ReplySchema } from './reply.schema';
import { ReplyService } from './reply.service';
import { ReplyController } from './reply.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reply.name, schema: ReplySchema }]),
  ],
  controllers: [ReplyController],
  providers: [ReplyService],
  exports: [ReplyService],
})
export class ReplyModule {}
