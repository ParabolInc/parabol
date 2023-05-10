import {getUserByEmail, getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {isSuperUser} from '../../../utils/authorization'
import SlackServerManager from '../../../utils/SlackServerManager'
import {MutationResolvers} from '../resolverTypes'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!

const unicodeToString = (unicodeInput?: string) => {
  try {
    // We're ignoring modifiers here, otherwise we'd need to split by `-`
    const unicode = Number.parseInt(unicodeInput, 16)
    if (!isNaN(unicode)) {
      return String.fromCodePoint(unicode)
    }
  } catch (_e) {
    // ignore
  }
  return undefined
}

const slackMessage: MutationResolvers['slackMessage'] = async (
  _source,
  {text, sender, mentions, emojis},
  {authToken}
) => {
  //const now = new Date()

  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // VALIDATION
  // RESOLUTION

  const manager = new SlackServerManager(SLACK_BOT_TOKEN)
  const slackUsers = (
    await Promise.all(
      mentions.map(async (slackUserId) => {
        const slackUserInfo = await manager.getUserInfo(slackUserId)
        const slackUser = slackUserInfo.ok ? slackUserInfo.user : null
        return slackUser
      })
    )
  ).filter(Boolean)

  const userEmails = slackUsers.map((user) => user.profile.email)
  const parabolUsers = await getUsersByEmails(userEmails)
  const reactions = emojis.map((emoji) => unicodeToString(emoji.unicode)).filter(Boolean)

  console.log('GEORG mutation', parabolUsers, reactions)
  return true
}

export default slackMessage
