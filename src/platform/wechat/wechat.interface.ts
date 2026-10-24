export interface IWechatAdapter {
	send(buffer: Buffer): Buffer;
	connect(url: string): void;
	// oxlint-disable-next-line typescript/no-explicit-any
	listen(url: string, callback: (...args: any[]) => void): void;
}
