import {
	Inject,
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import { Socket } from '@rustup/nng';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class WechatAdapter
	implements IWechatAdapter, OnModuleInit, OnModuleDestroy
{
	constructor(
		@Inject('WECHAT_SOCKET') private socket: Socket,
		@Inject() private configService: ConfigService,
	) {
		this.cmdUrl = `tcp://${this.configService.getOrThrow<string>('REMOTE_HOST')}:${this.configService.getOrThrow<number>('REMOTE_PORT')}`;
		this.msgUrl = `tcp://${this.configService.getOrThrow<string>('REMOTE_HOST')}:${this.configService.getOrThrow<number>('REMOTE_PORT') + 1}`;
	}
	onModuleInit() {
		this.startRecvMessage();
	}
	onModuleDestroy() {
		this.stopRecvMessage();
	}

	private cmdUrl: string;
	private msgUrl: string;
	private messageRecvDisposable:
		ReturnType<typeof Socket.recvMessage> | undefined;

	send(buffer: Buffer): Buffer {
		if (this.socket.connected()) {
			return this.socket.send(buffer);
		}
		throw new Error('Socket is not connected');
	}

	connect(): void {
		if (!this.socket.connected()) {
			this.socket.connect(this.cmdUrl);
		}
	}

	private startRecvMessage() {
		this.messageRecvDisposable = Socket.recvMessage(
			this.msgUrl,
			undefined,
			(err: unknown | undefined, buf: Buffer) => {},
		);
	}

	private stopRecvMessage() {
		this.messageRecvDisposable?.dispose();
		this.messageRecvDisposable = undefined;
	}
}
