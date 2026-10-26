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

export interface IWechatService {
	stopListening(): void;
	isLogin(): boolean;
	getSelfWxid(): string;
	getMessageType(): Map<number, string>;
	getContacts(): WechatToPlainType<wcf.RpcContact>[];
	getDbTables(payload: { db: string }): WechatToPlainType<wcf.DbTable>[];
	getUserInfo(): WechatToPlainType<wcf.UserInfo>;
	getDbNames(): string[];
	getAudioMessage(payload: { id: string; dir: string }): string;
	sendTextMessage(payload: {
		message: string;
		receiver: string;
		mentions?: string[];
	}): number;

	sendRichTextMessage(payload: {
		desc: Omit<ReturnType<wcf.RichText['toObject']>, 'receiver'>;
		receiver: string;
	}): number;

	sendPatMessage(payload: { roomId: string; wxid: string }): number;
	forwardMessage(payload: { id: string; receiver: string }): number;
	acceptFriendRequest(payload: {
		v3: string;
		v4: string;
		scene?: number;
	}): number;

	receiveTransfer(payload: {
		wxid: string;
		transferId: string;
		transactionId: string;
	}): number;

	refreshMoments(payload: { id: string }): number;

	downloadAttachment(payload: {
		id: string;
		thumb?: string;
		extra?: string;
	}): number;

	revokeMessage(payload: { id: string }): number;

	addRoomMembers(payload: { roomId: string; wxidList: string[] }): number;
	deleteRoomMembers(payload: { roomId: string; wxidList: string[] }): number;
	inviteRoomMembers(payload: { roomId: string; wxidList: string[] }): number;
}
