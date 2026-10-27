import type { WechatMessage } from '../wechat.js';

export class WechatMessageReceivedEvent {
	constructor(readonly payload: WechatMessage) {}
}
