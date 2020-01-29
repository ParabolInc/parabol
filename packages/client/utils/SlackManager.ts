interface SlackClientManagerOptions {
  fetch?: Window['fetch']
}

interface ErrorResponse {
  ok: false
  error: string
}

interface SlackIM {
  created: number
  id: string
  is_im: true
  is_org_shared: boolean
  is_user_deleted: boolean
  priority: number
  user: string
}

export interface SlackPublicConversation {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: false
  created: number
  creator: string
  is_archived: boolean
  is_general: boolean
  unlinked: number
  name_normalized: string
  is_read_only: boolean
  is_shared: boolean
  parent_conversation: null
  is_ext_shared: boolean
  is_org_shared: boolean
  pending_shared: []
  is_pending_ext_shared: boolean
  is_member: boolean
  is_private: boolean
  is_mpim: boolean
  last_read: string
  topic: {
    value: string
    creator: string
    last_set: number
  }
  purpose: {
    value: string
    creator: string
    last_set: number
  }
  previous_names: string[]
  locale: string
}

type SlackConversation = SlackPublicConversation | SlackIM

interface SlackChannelInfo {
  id: string
  name: string
  is_channel: boolean
  created: number
  is_archived: boolean
  is_general: boolean
  name_normalized: string
  is_shared: boolean
  is_org_shared: boolean
  is_member: boolean
  is_private: boolean
  is_mpim: boolean
  members: string[]
  topic: {
    value: string
    creator: string
    last_set: number
  }
  purpose: {
    value: string
    creator: string
    last_set: number
  }
  previous_names: string[]
  num_members: number
}

interface ChannelListResponse {
  ok: true
  channels: SlackChannelInfo[]
}

interface ConversationListResponse {
  ok: true
  channels: SlackConversation[]
}

interface PostMessageResponse {
  ok: true
}

interface UpdateMessageResponse {
  ok: true
  channel: string
  ts: string
  text: string
}

interface SlackUser {
  id: string
  team_id: string
  name: string
  deleted: boolean
  color: string
  real_name: string
  tz: string
  tz_label: string
  tz_offset: number
  profile: {
    avatar_hash: string
    status_text: string
    status_emoj: string
    status_expiration: number
    real_name: string
    display_name: string
    real_name_normalized: string
    display_name_normalized: string
    // email?: string
    image_original: string
    image_24: string
    image_32: string
    image_48: string
    image_72: string
    image_192: string
    image_512: string
    team: string
  }
  is_admin: true
  is_owner: boolean
  is_primary_owner: boolean
  is_restricted: boolean
  is_ultra_restricted: boolean
  is_bot: boolean
  is_stranger: boolean
  updated: number
  is_app_user: boolean
  has_2fa: boolean
  locale: string
}

// interface SlackMessage {
//   type: 'message'
//   user: string
//   text: string
//   ts: string
//   attachments?: {
//     service_name: string
//     text: string
//     fallback: string
//     thumb_url: string
//     thumb_width: number
//     thumb_height: number
//     id: number
//   }[]
// }

interface UserInfoResponse {
  ok: true
  user: SlackUser
}

interface IMOpenResponse {
  ok: true
  channel: {
    id: string
  }
}

interface ConversationInfoResponse {
  ok: true
  channel: SlackConversation
}

interface ChannelInfoResponse {
  ok: true
  channel: SlackChannelInfo & {
    creator: string
    latest?: {
      text: string
      username: string
      bot_id: string
      attachments: {
        text: string
        id: number
        fallback: string
      }[]
      type: 'message'
      subtype: string
      ts: string
      unread_count: number
      unread_count_display: number
    }
  }
}

// interface ConversationHistoryResponse {
//   ok: true
//   message: SlackMessage[]
//   has_more: boolean
//   pin_count: number
//   response_metadata: {
//     next_cursor: string
//   }
// }
type ConversationType = 'public_channel' | 'private_channel' | 'im' | 'mpim'

class SlackManager {
  static SCOPE = 'identify,bot,incoming-webhook,channels:read,chat:write:bot'
  // token can be a botAccessToken or accessToken!
  token: string
  fetch: typeof fetch
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  headers: any

  constructor(token: string, options: SlackClientManagerOptions = {}) {
    this.token = token
    this.fetch = options.fetch || window.fetch.bind(window)
  }

  async get<T>(url: string): Promise<T | ErrorResponse> {
    const record = this.cache[url]
    if (!record) {
      const res = await this.fetch(encodeURI(url))
      const result = await res.json()
      this.cache[url] = {
        result,
        expiration: setTimeout(() => {
          delete this.cache[url]
        }, this.timeout)
      }
    } else {
      clearTimeout(record.expiration)
      record.expiration = setTimeout(() => {
        delete this.cache[url]
      }, this.timeout)
    }
    return this.cache[url].result
  }

  getConversationInfo(slackChannelId: string) {
    return this.get<ConversationInfoResponse>(
      `https://slack.com/api/conversations.info?token=${this.token}&channel=${slackChannelId}`
    )
  }

  getChannelInfo(channelId: string) {
    return this.get<ChannelInfoResponse>(
      `https://slack.com/api/channels.info?token=${this.token}&channel=${channelId}`
    )
  }

  getChannelList() {
    return this.get<ChannelListResponse>(
      `https://slack.com/api/channels.list?token=${this.token}&exclude_archived=1`
    )
  }

  // getConversationHistory(channelId: string) {
  //   const oldest = toEpochSeconds(Date.now() - ms('30m'))
  //   return this.get<ConversationHistoryResponse>(`https://slack.com/api/conversations.history?token=${
  //     this.token
  //     }&channel=${channelId}&oldest=${oldest}`)
  // }

  getConversationList(types: ConversationType[] = ['public_channel']) {
    const typeStr = types.join(',')
    return this.get<ConversationListResponse>(
      `https://slack.com/api/conversations.list?token=${this.token}&exclude_archived=1&types=${typeStr}`
    )
  }

  getUserInfo(userId: string) {
    return this.get<UserInfoResponse>(
      `https://slack.com/api/users.info?token=${this.token}&user=${userId}`
    )
  }

  postMessage(channelId: string, text: string) {
    return this.get<PostMessageResponse>(
      `https://slack.com/api/chat.postMessage?token=${this.token}&channel=${channelId}&text=${text}&unfurl_links=true`
    )
  }

  updateMessage(channelId: string, text: string, ts: string) {
    return this.get<UpdateMessageResponse>(
      `https://slack.com/api/chat.update?token=${this.token}&channel=${channelId}&text=${text}&ts=${ts}`
    )
  }

  openIM(slackUserId: string) {
    return this.get<IMOpenResponse>(
      `https://slack.com/api/im.open?token=${this.token}&user=${slackUserId}`
    )
  }
}

export default SlackManager
