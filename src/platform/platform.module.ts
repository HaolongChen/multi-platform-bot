import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service.js';
import { WechatModule } from './wechat/wechat.module.js';

@Module({
  providers: [PlatformService],
  imports: [WechatModule]
})
export class PlatformModule {}
