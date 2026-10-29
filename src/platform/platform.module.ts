import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service.js';
import { WechatModule } from './wechat/wechat.module.js';
import { ChatModule } from './chat/chat.module.js';
import { MediaModule } from './media/media.module.js';
import { UserModule } from './user/user.module.js';
import { Socket } from '@rustup/nng';
import { ImessageModule } from './imessage/imessage.module.js';

@Module({
	providers: [
		PlatformService,
		{ provide: 'WECHAT_SOCKET', useValue: new Socket({}) },
	],
	imports: [WechatModule, ChatModule, MediaModule, UserModule, ImessageModule],
})
export class PlatformModule {}
