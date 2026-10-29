import { Module } from '@nestjs/common';
import { WechatService } from './wechat.service.js';
import { WechatAdapter } from './wechat.adapter.js';
import { ConfigService } from '@nestjs/config';

@Module({
	providers: [
		WechatService,
		{ provide: 'WECHAT_ADAPTER', useClass: WechatAdapter },
		{
			provide: 'CMD_URL',
			useFactory: (configService: ConfigService) =>
				`tcp://${configService.getOrThrow<string>('WECHAT_HOST')}:${configService.getOrThrow<number>('WECHAT_CMD_PORT')}`,
			inject: [ConfigService],
		},
		{
			provide: 'MSG_URL',
			useFactory: (configService: ConfigService) =>
				`tcp://${configService.getOrThrow<string>('WECHAT_HOST')}:${configService.getOrThrow<number>('WECHAT_MSG_PORT')}`,
			inject: [ConfigService],
		},
	],
	exports: [WechatService],
})
export class WechatModule {}
