import { Inject, Injectable } from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import { wcf } from './wcf.js';
import { Wechat } from './wechat.js';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { WechatMessageReceivedEvent } from './event/wechat-message-received.event.js';
import type {
	CommandTypeMap,
	EventHandlerMap,
} from './event/wechat-message-created.event.js';

@Injectable()
export class WechatService {
	constructor(
		@Inject('WECHAT_ADAPTER') private adapter: IWechatAdapter,
		@Inject('CMD_URL') private cmdUrl: string,
		@Inject('MSG_URL') private msgUrl: string,
		private eventEmitter: EventEmitter2,
	) {}

	private send(message: wcf.Request): wcf.Response {
		const buffer = Buffer.from(message.serialize());
		const response = this.adapter.send(buffer);
		return wcf.Response.deserialize(response);
	}

	private adapterListener = (err: unknown | undefined, buffer: Buffer) => {
		if (err) {
			console.error('Error receiving message:', err);
			return;
		}
		const message = Wechat.toPlain(wcf.Response.deserialize(buffer).wxmsg);
		this.eventEmitter.emit(
			'wechat.messageReceived',
			new WechatMessageReceivedEvent(message),
		);
	};

	startListening() {
		this.adapter.connect(this.cmdUrl);
		this.adapter.listen(this.msgUrl, this.adapterListener);
		this.startRecvMessage();
	}

	private startRecvMessage() {
		const { status } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_ENABLE_RECV_TXT, flag: true }),
		);
		return status;
	}

	stopListening() {
		const { status } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_DISABLE_RECV_TXT }),
		);
		return status;
	}

	isLogin() {
		try {
			const { status } = this.send(
				new wcf.Request({ func: wcf.Functions.FUNC_IS_LOGIN }),
			);
			return status === 1;
		} catch (error) {
			console.error(error);
		}
		return false;
	}

	getSelfWxid() {
		const { str } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_SELF_WXID }),
		);
		return str;
	}

	getMessageType() {
		const { types } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_MSG_TYPES }),
		);
		return types.types;
	}

	getContacts() {
		const { contacts } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_CONTACTS }),
		);
		return contacts.contacts.map(Wechat.toPlain);
	}

	getDbNames() {
		const { dbs } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_DB_NAMES }),
		);
		return dbs.names;
	}

	getDbTables(payload: { db: string }) {
		const { tables } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_GET_DB_TABLES,
				str: payload.db,
			}),
		);
		return tables.tables.map(Wechat.toPlain);
	}

	getUserInfo() {
		const { ui } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_USER_INFO }),
		);
		return Wechat.toPlain(ui);
	}

	getAudioMessage(payload: { id: string; dir: string }) {
		const { str } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_GET_AUDIO_MSG,
				am: new wcf.AudioMsg(payload),
			}),
		);
		return str;
	}

	sendTextMessage(payload: {
		message: string;
		receiver: string;
		mentions?: string[];
	}) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_SEND_TXT,
				txt: new wcf.TextMsg({
					msg: payload.message,
					receiver: payload.receiver,
					aters: payload.mentions?.join(','),
				}),
			}),
		);
		return status;
	}

	sendRichTextMessage(payload: {
		desc: Omit<ReturnType<wcf.RichText['toObject']>, 'receiver'>;
		receiver: string;
	}) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_SEND_RICH_TXT,
				rt: new wcf.RichText(payload),
			}),
		);
		return status;
	}

	sendPatMessage(payload: { roomId: string; wxid: string }) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_SEND_PAT_MSG,
				pm: new wcf.PatMsg({ roomid: payload.roomId, wxid: payload.wxid }),
			}),
		);
		return status;
	}

	forwardMessage(payload: { id: string; receiver: string }) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_FORWARD_MSG,
				fm: new wcf.ForwardMsg(payload),
			}),
		);
		return status;
	}

	acceptFriendRequest(payload: { v3: string; v4: string; scene?: number }) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_ACCEPT_FRIEND,
				v: new wcf.Verification({ scene: payload.scene ?? 30, ...payload }),
			}),
		);
		return status;
	}

	receiveTransfer(payload: {
		wxid: string;
		transferId: string;
		transactionId: string;
	}) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_RECV_TRANSFER,
				tf: new wcf.Transfer({
					wxid: payload.wxid,
					tfid: payload.transferId,
					taid: payload.transactionId,
				}),
			}),
		);
		return status;
	}

	refreshMoments(payload: { id: string }) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_REFRESH_PYQ,
				ui64: payload.id,
			}),
		);
		return status;
	}

	downloadAttachment(payload: {
		id: string;
		thumb?: string;
		extra?: string;
	}): number {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_DOWNLOAD_ATTACH,
			att: new wcf.AttachMsg({
				id: payload.id,
				thumb: payload.thumb || '',
				extra: payload.extra || '',
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	revokeMessage(payload: { id: string }) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_REVOKE_MSG,
				ui64: payload.id,
			}),
		);
		return status;
	}

	addRoomMembers(payload: { roomId: string; wxidList: string[] }) {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_ADD_ROOM_MEMBERS,
			m: new wcf.MemberMgmt({
				roomid: payload.roomId,
				wxids: payload.wxidList.join(',').replaceAll(' ', ''),
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	deleteRoomMembers(payload: { roomId: string; wxidList: string[] }) {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_DEL_ROOM_MEMBERS,
			m: new wcf.MemberMgmt({
				roomid: payload.roomId,
				wxids: payload.wxidList.join(',').replaceAll(' ', ''),
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	inviteRoomMembers(payload: { roomId: string; wxidList: string[] }) {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_INV_ROOM_MEMBERS,
			m: new wcf.MemberMgmt({
				roomid: payload.roomId,
				wxids: payload.wxidList.join(',').replaceAll(' ', ''),
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	/**
	 * Get an event handler for a specific command type.
	 */
	public getEventHandler = <T extends keyof CommandTypeMap>(
		token: T,
	): EventHandlerMap[T] => {
		switch (token) {
			case 'IS_LOGIN':
				return () => this.isLogin();
			case 'GET_SELF_WXID':
				return () => this.getSelfWxid();
			case 'GET_MESSAGE_TYPES':
				return () => this.getMessageType();
			case 'GET_CONTACTS':
				return () => this.getContacts();
			case 'GET_DB_TABLES':
				return (payload: { db: string }) => this.getDbTables(payload);
			case 'GET_USER_INFO':
				return () => this.getUserInfo();
			case 'GET_DB_NAMES':
				return () => this.getDbNames();
			case 'GET_AUDIO_MESSAGE':
				return (payload: { id: string; dir: string }) =>
					this.getAudioMessage(payload);
			case 'SEND_TEXT_MESSAGE':
				return (payload: {
					message: string;
					receiver: string;
					mentions?: string[];
				}) => this.sendTextMessage(payload);
			case 'SEND_RICH_TEXT_MESSAGE':
				return (payload: {
					desc: Omit<ReturnType<wcf.RichText['toObject']>, 'receiver'>;
					receiver: string;
				}) => this.sendRichTextMessage(payload);
			case 'SEND_PAT_MESSAGE':
				return (payload: { roomId: string; wxid: string }) =>
					this.sendPatMessage(payload);
			case 'FORWARD_MESSAGE':
				return (payload: { id: string; receiver: string }) =>
					this.forwardMessage(payload);
			case 'ACCEPT_FRIEND_REQUEST':
				return (payload: { v3: string; v4: string; scene?: number }) =>
					this.acceptFriendRequest(payload);
			case 'RECEIVE_TRANSFER':
				return (payload: {
					wxid: string;
					transferId: string;
					transactionId: string;
				}) => this.receiveTransfer(payload);
			case 'REFRESH_MOMENTS':
				return (payload: { id: string }) => this.refreshMoments(payload);
			case 'DOWNLOAD_ATTACHMENT':
				return (payload: { id: string; thumb?: string; extra?: string }) =>
					this.downloadAttachment(payload);
			case 'REVOKE_MESSAGE':
				return (payload: { id: string }) => this.revokeMessage(payload);
			case 'ADD_ROOM_MEMBERS':
				return (payload: { roomId: string; wxidList: string[] }) =>
					this.addRoomMembers(payload);
			case 'DELETE_ROOM_MEMBERS':
				return (payload: { roomId: string; wxidList: string[] }) =>
					this.deleteRoomMembers(payload);
			case 'INVITE_ROOM_MEMBERS':
				return (payload: { roomId: string; wxidList: string[] }) =>
					this.inviteRoomMembers(payload);
			case 'STOP_LISTENING':
				return () => this.stopListening();
			default:
				throw new Error(`Unknown command type: ${token}`);
		}
	};
}
