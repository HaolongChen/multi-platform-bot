import { Module } from '@nestjs/common';
import { WechatService } from './wechat.service.js';
import { WechatAdapter } from './wechat.adapter.js';

@Module({
	providers: [
		WechatService,
		{ provide: 'WECHAT_ADAPTER', useClass: WechatAdapter },
	],
	exports: [WechatService],
})
export class WechatModule {}
