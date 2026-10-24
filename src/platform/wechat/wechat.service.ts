import { Inject, Injectable } from '@nestjs/common';
import type { IWechatAdapter } from './wechat.interface.js';
import { wcf } from './wcf.js';
import { WechatDTO } from './wechat.dto.js';

@Injectable()
export class WechatService {
	@Inject('WECHAT_ADAPTER')
	private adapter: IWechatAdapter;

	private send(message: wcf.Request): wcf.Response {
		const buffer = Buffer.from(message.serialize());
		const response = this.adapter.send(buffer);
		return wcf.Response.deserialize(response);
	}

	connect() {
		this.adapter.connect();
	}

	startRecvMessage() {
		const { status } = this.send(
			new wcf.Request({ func: wcf.Functions.FUNC_ENABLE_RECV_TXT, flag: true }),
		);
		return status;
	}

	stopRecvMessage() {
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
}
