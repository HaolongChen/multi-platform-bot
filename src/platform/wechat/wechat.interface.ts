export interface IWechatAdapter {
	send ( buffer: Buffer ): Buffer;
	connect (): void;
}
