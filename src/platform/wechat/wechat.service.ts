import { Inject, Injectable } from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import { wcf } from './wcf.js';
import { WechatDTO } from './wechat.dto.js';
import type { EventEmitter2 } from '@nestjs/event-emitter';

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
		const message = wcf.Response.deserialize(buffer);
		this.eventEmitter.emit('wechat.messageReceived', message);
	};

	startListen() {
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

	stopListen() {
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
		return contacts.contacts.map(WechatDTO.toPlain);
	}

	getDbNames() {
		const { dbs } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_DB_NAMES }),
		);
		return dbs.names;
	}

	getDbTables(db: string) {
		const { tables } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_DB_TABLES, str: db }),
		);
		return tables.tables.map(WechatDTO.toPlain);
	}

	getUserInfo() {
		const { ui } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_GET_USER_INFO }),
		);
		return WechatDTO.toPlain(ui);
	}

	getAudioMessage(id: string, dir: string) {
		const { str } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_GET_AUDIO_MSG,
				am: new wcf.AudioMsg({ id, dir }),
			}),
		);
		return str;
	}

	sendTextMessage(message: string, receiver: string, mentions: string[] = []) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_SEND_TXT,
				txt: new wcf.TextMsg({
					msg: message,
					receiver,
					aters: mentions?.join(','),
				}),
			}),
		);
		return status;
	}

	sendRichTextMessage(
		desc: Omit<ReturnType<wcf.RichText['toObject']>, 'receiver'>,
		receiver: string,
	) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_SEND_RICH_TXT,
				rt: new wcf.RichText({ ...desc, receiver }),
			}),
		);
		return status;
	}

	sendPatMessage(roomId: string, wxid: string) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_SEND_PAT_MSG,
				pm: new wcf.PatMsg({ roomid: roomId, wxid }),
			}),
		);
		return status;
	}

	forwardMessage(id: string, receiver: string) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_FORWARD_MSG,
				fm: new wcf.ForwardMsg({ id, receiver }),
			}),
		);
		return status;
	}

	acceptFriendRequest(v3: string, v4: string, scene = 30) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_ACCEPT_FRIEND,
				v: new wcf.Verification({ v3, v4, scene }),
			}),
		);
		return status;
	}

	receiveTransfer(wxid: string, transferId: string, transactionId: string) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_RECV_TRANSFER,
				tf: new wcf.Transfer({ wxid, tfid: transferId, taid: transactionId }),
			}),
		);
		return status;
	}

	refreshMoment(id: string) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_REFRESH_PYQ,
				ui64: id,
			}),
		);
		return status;
	}

	downloadAttach(id: string, thumb: string = '', extra: string = ''): number {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_DOWNLOAD_ATTACH,
			att: new wcf.AttachMsg({
				id,
				thumb,
				extra,
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	revokeMessage(id: string) {
		const { status } = this.send(
			new wcf.Request({
				func: wcf.Functions.FUNC_REVOKE_MSG,
				ui64: id,
			}),
		);
		return status;
	}

	addRoomMembers(roomId: string, wxidList: string[]) {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_ADD_ROOM_MEMBERS,
			m: new wcf.MemberMgmt({
				roomid: roomId,
				wxids: wxidList.join(',').replaceAll(' ', ''),
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	deleteRoomMembers(roomId: string, wxidList: string[]) {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_DEL_ROOM_MEMBERS,
			m: new wcf.MemberMgmt({
				roomid: roomId,
				wxids: wxidList.join(',').replaceAll(' ', ''),
			}),
		});
		const { status } = this.send(req);
		return status;
	}

	inviteRoomMembers(roomId: string, wxidList: string[]) {
		const req = new wcf.Request({
			func: wcf.Functions.FUNC_INV_ROOM_MEMBERS,
			m: new wcf.MemberMgmt({
				roomid: roomId,
				wxids: wxidList.join(',').replaceAll(' ', ''),
			}),
		});
		const { status } = this.send(req);
		return status;
	}
}
