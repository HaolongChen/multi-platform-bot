import { Test, type TestingModule } from '@nestjs/testing';
import { WechatAdapter } from './wechat.adapter.js';
import { WechatService } from './wechat.service.js';
import { Socket } from '@rustup/nng';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { WechatMessageCreatedEvent } from './event/wechat-message-created.event.js';

describe('WechatService', () => {
	let wechatService: WechatService;
	let eventEmitter: EventEmitter2;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WechatService,
				{
					provide: 'CMD_URL',
					useValue: 'tcp://100.84.196.105:10086',
				},
				{
					provide: 'MSG_URL',
					useValue: 'tcp://100.84.196.105:10087',
				},
				{
					provide: 'WECHAT_SOCKET',
					useValue: new Socket({}),
				},
				{ provide: 'WECHAT_ADAPTER', useClass: WechatAdapter },
			],
			imports: [EventEmitterModule.forRoot()],
		}).compile();
		wechatService = module.get<WechatService>(WechatService);
		eventEmitter = module.get(EventEmitter2);
	});

	it('start listening', () => {
		const status = wechatService.startListening();
		expect(status).toBe(0);
	});

	it('should be logged in', async () => {
		const { promise, resolve, reject } = Promise.withResolvers<boolean>();
		eventEmitter.emit(
			'wechat.messageCreated',
			new WechatMessageCreatedEvent('IS_LOGIN', {
				resolve,
				reject,
				payload: undefined,
			}),
		);
		await expect(promise).resolves.toBe(true);
	});

	afterAll(async () => {
		const status = wechatService.stopListening();
		expect(status).toBe(0);
	});
});
