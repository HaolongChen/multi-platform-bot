import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service.js';
import { WechatModule } from './wechat/wechat.module.js';
import { ChatModule } from './chat/chat.module.js';
import { MediaModule } from './media/media.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  providers: [PlatformService],
  imports: [WechatModule, ChatModule, MediaModule, UserModule]
})
export class PlatformModule {}
