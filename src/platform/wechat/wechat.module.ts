import { Module } from '@nestjs/common';
import { WechatService } from './wechat.service.js';

@Module({
  providers: [WechatService]
})
export class WechatModule {}
