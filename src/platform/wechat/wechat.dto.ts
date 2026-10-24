import type { wcf } from "./wcf.js";

type ToPlainType<T extends { toObject: () => unknown }> = Required<
	ReturnType<T['toObject']>
>;

export class WechatDTO {
	static toPlain<T extends { toObject: () => unknown }>(
		data: T,
	): ToPlainType<T> {
		return data.toObject() as ToPlainType<T>;
	}
}

export type WechatMessage = ToPlainType<wcf.Response['wxmsg']>;