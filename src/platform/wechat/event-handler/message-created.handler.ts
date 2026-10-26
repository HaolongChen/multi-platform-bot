import { OnEvent } from "@nestjs/event-emitter";
import { WechatMessagingCommandList } from "../wechat.js";
import type { WechatMessageCreatedEvent } from "../event/wechat-message-created.event.js";

export class WechatMessageCreatedEventHandler
{
  @OnEvent( 'wechat.messageCreated' )
  handleMessageCreatedEvent<T extends keyof typeof WechatMessagingCommandList> ( payload: WechatMessageCreatedEvent<T> )
  {
    
  }
}