import { Controller, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':id')
  async getMessage(@Param('id') id: string) {
    return await this.messageService.getMessage(id);
  }
}
