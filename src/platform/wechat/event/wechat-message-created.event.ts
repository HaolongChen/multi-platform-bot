import type { wcf } from '../wcf.js';
import {
	WechatMessagingCommandList,
	type WechatToPlainType,
} from '../wechat.js';

export class WechatMessageCreatedEvent<
	T extends keyof typeof WechatMessagingCommandList,
> {
	constructor(readonly payload: CommandTypeMap[T]) {}
}

type EventPromiseType<T = undefined> = {
	resolve: T extends undefined ? () => void : (value: T) => void;
	// oxlint-disable-next-line typescript/no-explicit-any
	reject: (reason?: any) => void;
};


type ExtractPayload<T extends keyof typeof WechatMessagingCommandList> =
	CommandTypeMap[T]['resolve'] extends () => void ? void
	: CommandTypeMap[T]['resolve'] extends (value: infer U) => void ? U
	: never;

export type CommandTypeMap = {
	IS_LOGIN: EventPromiseType;
	GET_SELF_WXID: EventPromiseType<string>;
	GET_MESSAGE_TYPES: EventPromiseType<Map<number, string>>;
	GET_CONTACTS: EventPromiseType<WechatToPlainType<wcf.RpcContacts>>;
	GET_DB_TABLES: EventPromiseType<WechatToPlainType<wcf.DbTables>> & {
		db: string;
	};
	GET_USER_INFO: EventPromiseType<WechatToPlainType<wcf.UserInfo>>;
	GET_DB_NAMES: EventPromiseType<string[]>;
	GET_AUDIO_MESSAGE: EventPromiseType<string> & { id: string; dir: string };
	SEND_TEXT_MESSAGE: EventPromiseType<number> & {
		message: string;
		receiver: string;
		mentions?: string[];
	};
	SEND_RICH_TEXT_MESSAGE: EventPromiseType<number> & {
		desc: Omit<ReturnType<wcf.RichText['toObject']>, 'receiver'>;
		receiver: string;
	};
	SEND_PAT_MESSAGE: EventPromiseType<number> & {
		roomId: string;
		wxid: string;
	};
	FORWARD_MESSAGE: EventPromiseType<number> & {
		id: string;
		receiver: string;
	};
	ACCEPT_FRIEND_REQUEST: EventPromiseType<number> & {
		v3: string;
		v4: string;
		scene?: number;
	};
	RECEIVE_TRANSFER: EventPromiseType<number> & {
		wxid: string;
		transferId: string;
		transactionId: string;
	};
	REFRESH_MOMENTS: EventPromiseType<number> & { id: string };
	DOWNLOAD_ATTACHMENT: EventPromiseType<number> & {
		id: string;
		thumb?: string;
		extra?: string;
	};
	REVOKE_MESSAGE: EventPromiseType<number> & { id: string };
	ADD_ROOM_MEMBERS: EventPromiseType<number> & {
		roomId: string;
		wxids: string[];
	};
	DELETE_ROOM_MEMBERS: EventPromiseType<number> & {
		roomId: string;
		wxids: string[];
	};
	INVITE_ROOM_MEMBERS: EventPromiseType<number> & {
		roomId: string;
		wxids: string[];
	};
	STOP_LISTENING: EventPromiseType<number>;
};

export type EventHandlerMap = {
	[T in keyof typeof WechatMessagingCommandList]: Exclude<
		keyof CommandTypeMap[T],
		'resolve' | 'reject'
	> extends never ?
		() => ExtractPayload<T>
	:	 (
			payload: Omit<CommandTypeMap[T], 'resolve' | 'reject'>,
		) => ExtractPayload<T>;
};

