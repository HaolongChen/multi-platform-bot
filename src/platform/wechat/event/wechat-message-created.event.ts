import {
	WechatMessagingCommandList,
	type IWechatService,
} from '../wechat.js';

export class WechatMessageCreatedEvent<
	T extends keyof typeof WechatMessagingCommandList,
> {
	constructor(readonly command: T, readonly payload: BuildMessageCreatedEvent<T>) {}
}


export type BuildMessageCreatedEvent<T extends keyof typeof WechatMessagingCommandList> = {
  resolve: ( value: ReturnType<IWechatService[ typeof WechatMessagingCommandList[ T ] ]> ) => void;
  // oxlint-disable-next-line typescript/no-explicit-any
  reject: ( reason?: any ) => void;
  payload: Parameters<IWechatService[ typeof WechatMessagingCommandList[ T ] ]>[0];
}