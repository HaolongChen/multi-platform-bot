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

export const WechatMessagingCommandList = {
	IS_LOGIN: 'isLogin',
	GET_SELF_WXID: 'getSelfWxid',
	GET_MESSAGE_TYPES: 'getMessageType',
	GET_CONTACTS: 'getContacts',
	GET_DB_TABLES: 'getDbTables',
	GET_USER_INFO: 'getUserInfo',
	GET_DB_NAMES: 'getDbNames',
	GET_AUDIO_MESSAGE: 'getAudioMessage',
	SEND_TEXT_MESSAGE: 'sendTextMessage',
	SEND_RICH_TEXT_MESSAGE: 'sendRichTextMessage',
	SEND_PAT_MESSAGE: 'sendPatMessage',
	FORWARD_MESSAGE: 'forwardMessage',
	ACCEPT_FRIEND_REQUEST: 'acceptFriendRequest',
	RECEIVE_TRANSFER: 'receiveTransfer',
	REFRESH_MOMENTS: 'refreshMoments',
	DOWNLOAD_ATTACHMENT: 'downloadAttachment',
	REVOKE_MESSAGE: 'revokeMessage',
	ADD_ROOM_MEMBERS: 'addRoomMembers',
	DELETE_ROOM_MEMBERS: 'deleteRoomMembers',
	INVITE_ROOM_MEMBERS: 'inviteRoomMembers',
	STOP_LISTENING: 'stopListening',
} as const;


export type IWechatService = {
	readonly [WechatMessagingCommandList.STOP_LISTENING]: () => void;
	readonly [WechatMessagingCommandList.IS_LOGIN]: () => boolean;
	readonly [WechatMessagingCommandList.GET_SELF_WXID]: () => string;
	readonly [WechatMessagingCommandList.GET_MESSAGE_TYPES]: () => Map<number, string>;
	readonly [WechatMessagingCommandList.GET_CONTACTS]: () => WechatToPlainType<wcf.RpcContact>[];
	readonly [WechatMessagingCommandList.GET_DB_TABLES]: (payload: { db: string }) => WechatToPlainType<wcf.DbTable>[];
	readonly [WechatMessagingCommandList.GET_USER_INFO]: () => WechatToPlainType<wcf.UserInfo>;
	readonly [WechatMessagingCommandList.GET_DB_NAMES]: () => string[];
	readonly [WechatMessagingCommandList.GET_AUDIO_MESSAGE]: (payload: { id: string; dir: string }) => string;
	readonly [WechatMessagingCommandList.SEND_TEXT_MESSAGE]: (payload: {
		message: string;
		receiver: string;
		mentions?: string[];
	}) => number;

	readonly [WechatMessagingCommandList.SEND_RICH_TEXT_MESSAGE]: (payload: {
		desc: Omit<ReturnType<wcf.RichText['toObject']>, 'receiver'>;
		receiver: string;
	}) => number;

	readonly [WechatMessagingCommandList.SEND_PAT_MESSAGE]: (payload: { roomId: string; wxid: string }) => number;
	readonly [WechatMessagingCommandList.FORWARD_MESSAGE]: (payload: { id: string; receiver: string }) => number;
	readonly [WechatMessagingCommandList.ACCEPT_FRIEND_REQUEST]: (payload: {
		v3: string;
		v4: string;
		scene?: number;
	}) => number;

	readonly [WechatMessagingCommandList.RECEIVE_TRANSFER]: (payload: {
		wxid: string;
		transferId: string;
		transactionId: string;
	}) => number;

	readonly [WechatMessagingCommandList.REFRESH_MOMENTS]: (payload: { id: string }) => number;

	readonly [WechatMessagingCommandList.DOWNLOAD_ATTACHMENT]: (payload: {
		id: string;
		thumb?: string;
		extra?: string;
	}) => number;

	readonly [WechatMessagingCommandList.REVOKE_MESSAGE]: (payload: { id: string }) => number;

	readonly [WechatMessagingCommandList.ADD_ROOM_MEMBERS]: (payload: { roomId: string; wxidList: string[] }) => number;
	readonly [WechatMessagingCommandList.DELETE_ROOM_MEMBERS]: (payload: { roomId: string; wxidList: string[] }) => number;
	readonly [WechatMessagingCommandList.INVITE_ROOM_MEMBERS]: (payload: { roomId: string; wxidList: string[] }) => number;
}

type _NotUnion<T, U> = U extends any ? [T] extends [U] ? unknown : never : never;
export type NotUnion<T> = [T] extends [infer U] ? _NotUnion<U, U> : never;