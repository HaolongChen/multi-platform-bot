// oxlint-disable typescript/no-explicit-any
import type { wcf } from './wcf.js';

type ToPlainType<T extends { toObject: () => unknown }> = Required<
	ReturnType<T['toObject']>
>;

export type WechatToPlainType<T extends { toObject: () => unknown }> =
	T extends Array<infer U> ?
		U extends { toObject: () => unknown } ?
			Array<ToPlainType<U>>
		:	never
	:	ToPlainType<T>;

export class Wechat {
	static toPlain<T extends { toObject: () => unknown }>(
		data: T,
	): ToPlainType<T> {
		return data.toObject() as ToPlainType<T>;
	}
}

export type WechatMessage = ToPlainType<wcf.Response['wxmsg']>;

export const WechatMessagingCommandList: Record<
	string,
	keyof typeof wcf.Functions
> = {
	IS_LOGIN: 'FUNC_IS_LOGIN',
	GET_SELF_WXID: 'FUNC_GET_SELF_WXID',
	GET_MESSAGE_TYPES: 'FUNC_GET_MSG_TYPES',
	GET_CONTACTS: 'FUNC_GET_CONTACTS',
	GET_DB_TABLES: 'FUNC_GET_DB_TABLES',
	GET_USER_INFO: 'FUNC_GET_USER_INFO',
	GET_DB_NAMES: 'FUNC_GET_DB_NAMES',
	GET_AUDIO_MESSAGE: 'FUNC_GET_AUDIO_MSG',
	SEND_TEXT_MESSAGE: 'FUNC_SEND_TXT',
	SEND_RICH_TEXT_MESSAGE: 'FUNC_SEND_RICH_TXT',
	SEND_PAT_MESSAGE: 'FUNC_SEND_PAT_MSG',
	FORWARD_MESSAGE: 'FUNC_FORWARD_MSG',
	ACCEPT_FRIEND_REQUEST: 'FUNC_ACCEPT_FRIEND',
	RECEIVE_TRANSFER: 'FUNC_RECV_TRANSFER',
	REFRESH_MOMENTS: 'FUNC_REFRESH_PYQ',
	DOWNLOAD_ATTACHMENT: 'FUNC_DOWNLOAD_ATTACH',
	REVOKE_MESSAGE: 'FUNC_REVOKE_MSG',
	ADD_ROOM_MEMBERS: 'FUNC_ADD_ROOM_MEMBERS',
	DELETE_ROOM_MEMBERS: 'FUNC_DEL_ROOM_MEMBERS',
	INVITE_ROOM_MEMBERS: 'FUNC_INV_ROOM_MEMBERS',
	STOP_LISTENING: 'FUNC_DISABLE_RECV_TXT',
} as const;

export type WechatMessagingCommand = Record<
	keyof typeof WechatMessagingCommandList,
	{ [key: Exclude<string, 'resolve' | 'reject'>]: any } & {
		resolve: (value: any) => void;
		reject: (reason?: any) => void;
	}
>;
