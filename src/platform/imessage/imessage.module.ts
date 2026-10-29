import { Module } from '@nestjs/common';
import { ImessageService } from './imessage.service.js';

@Module({
  providers: [ImessageService]
})
export class ImessageModule {}
