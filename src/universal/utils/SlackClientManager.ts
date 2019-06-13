import makeHref from 'universal/utils/makeHref'
import {SLACK_SCOPE} from 'universal/utils/constants'
import getOAuthPopupFeatures from 'universal/utils/getOAuthPopupFeatures'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'
import AddSlackAuthMutation from 'universal/mutations/AddSlackAuthMutation'
import Atmosphere from 'universal/Atmosphere'

interface SlackClientManagerOptions {
  fetch?: Window['fetch']
}

interface ErrorResponse {
  ok: false
  error: string
}

interface SlackConversation {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
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

interface ConversationListResponse {
  ok: true
  channels: SlackConversation[]
}

interface PostMessageResponse {
  ok: true
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

class SlackClientManager {
  static openOAuth (atmosphere: Atmosphere, teamId: string, mutationProps: MenuMutationProps) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random()
      .toString(36)
      .substring(5)
    const redirect = makeHref('/auth/slack')
    const uri = `https://slack.com/oauth/authorize?client_id=${
      window.__ACTION__.slack
    }&scope=${SLACK_SCOPE}&state=${providerState}&redirect_uri=${redirect}`
    console.log('adding message listener')
    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 600, top: 56})
    )
    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddSlackAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }

  botAccessToken: string
  fetch: typeof fetch
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  headers: any

  constructor (botAccessToken: string, options: SlackClientManagerOptions = {}) {
    this.botAccessToken = botAccessToken
    this.fetch = options.fetch || window.fetch.bind(window)
  }

  async get<T> (url: string): Promise<T | ErrorResponse> {
    const record = this.cache[url]
    if (!record) {
      const res = await this.fetch(url)
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

  getConversationInfo (slackChannelId: string) {
    return this.get<ConversationInfoResponse>(
      `https://slack.com/api/conversations.info?token=${
        this.botAccessToken
      }&channel=${slackChannelId}`
    )
  }

  getConversationList () {
    return this.get<ConversationListResponse>(
      `https://slack.com/api/conversations.list?token=${
        this.botAccessToken
      }&exclude_archived=1&types=public_channel,private_channel,mpim,im`
    )
  }

  getUserInfo (userId: string) {
    return this.get<UserInfoResponse>(
      `https://slack.com/api/users.info?token=${this.botAccessToken}&user=${userId}`
    )
  }

  postMessage (channelId: string, text: string) {
    return this.get<PostMessageResponse>(
      `https://slack.com/api/chat.postMessage?token=${
        this.botAccessToken
      }&channel=${channelId}&text=${text}&unfurl_links=true`
    )
  }

  openIM (slackUserId: string) {
    return this.get<IMOpenResponse>(
      `https://slack.com/api/im.open?token=${this.botAccessToken}&user=${slackUserId}`
    )
  }
}

export default SlackClientManager
