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
				`tcp://${configService.getOrThrow<string>('REMOTE_HOST')}:${configService.getOrThrow<number>('REMOTE_PORT')}`,
			inject: [ConfigService],
		},
		{
			provide: 'MSG_URL',
			useFactory: (configService: ConfigService) =>
				`tcp://${configService.getOrThrow<string>('REMOTE_HOST')}:${configService.getOrThrow<number>('REMOTE_PORT') + 1}`,
			inject: [ConfigService],
		},
	],
	exports: [WechatService],
})
export class WechatModule {}
