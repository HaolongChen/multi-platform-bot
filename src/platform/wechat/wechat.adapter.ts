import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import { Socket } from '@rustup/nng';

@Injectable()
export class WechatAdapter implements IWechatAdapter, OnModuleDestroy {
	constructor(@Inject('WECHAT_SOCKET') private socket: Socket) {}
	onModuleDestroy() {
		this.stopRecvMessage();
	}
	private messageRecvDisposable:
		ReturnType<typeof Socket.recvMessage> | undefined;

	send(buffer: Buffer): Buffer {
		if (this.socket.connected()) {
			return this.socket.send(buffer);
		}
		throw new Error('Socket is not connected');
	}

	connect(url: string): void {
		if (!this.socket.connected()) {
			this.socket.connect(url);
		}
	}

	// oxlint-disable-next-line typescript/no-explicit-any
	listen(url: string, callback: (...args: any[]) => void): void {
		if (!this.messageRecvDisposable) {
			this.messageRecvDisposable = Socket.recvMessage(url, undefined, callback);
		}
	}

	private stopRecvMessage() {
		this.messageRecvDisposable?.dispose();
		this.messageRecvDisposable = undefined;
	}
}
