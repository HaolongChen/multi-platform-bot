import { Inject, Injectable } from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import { wcf } from './wcf.js';
import {
	Wechat,
	WechatMessagingCommandList,
	type IWechatService,
} from './wechat.js';
import { OnEvent, type EventEmitter2 } from '@nestjs/event-emitter';
import { WechatMessageReceivedEvent } from './event/wechat-message-received.event.js';
import type { WechatMessageCreatedEvent } from './event/wechat-message-created.event.js';

@Injectable()
export class WechatService implements IWechatService {
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

	@OnEvent('wechat.messageCreated')
	onMessageCreated<T extends keyof typeof WechatMessagingCommandList>(
		payload: WechatMessageCreatedEvent<T>,
	) {
		const data = payload.payload.payload;
		const resolve = payload.payload.resolve;
		const handler = this[
			WechatMessagingCommandList[payload.command]
		] as typeof data extends undefined ? () => Parameters<typeof resolve>[0]
		:	(payload: typeof data) => Parameters<typeof resolve>[0];
		resolve(handler(data));
	}
}
