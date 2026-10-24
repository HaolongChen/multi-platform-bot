import { Inject, Injectable } from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import type { Socket } from '@rustup/nng';

@Injectable()
export class WechatAdapter implements IWechatAdapter {
	@Inject('WECHAT_SOCKET')
	private socket: Socket;
	send(buffer: Buffer): Buffer {
		if (this.socket.connected()) {
			return this.socket.send(buffer);
		}
		throw new Error('Socket is not connected');
	}
}
