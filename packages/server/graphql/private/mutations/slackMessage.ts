import getKysely from '../../../postgres/getKysely'
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
  const pg = getKysely()

  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // VALIDATION
  // RESOLUTION

  const manager = new SlackServerManager(SLACK_BOT_TOKEN)
  const [slackSender, ...slackUsers] = await Promise.all(
    [sender, ...mentions].map(async (slackUserId) => {
      const slackUserInfo = await manager.getUserInfo(slackUserId)
      const slackUser = slackUserInfo.ok ? slackUserInfo.user : null
      return slackUser
    })
  )

  if (!slackSender) {
    console.log('no slack sender')
    return true
  }

  const userEmails = [slackSender, ...slackUsers].map((user) => user.profile.email)
  const parabolUsers = await getUsersByEmails(userEmails)

  const reactions = emojis
    .map(({name, unicode}) => ({
      name,
      emoji: unicodeToString(unicode)
    }))
    .filter(({emoji}) => !!emoji)

  const parabolSender = parabolUsers.find(({email}) => email === slackSender.profile.email)
  const parabolMentions = parabolUsers.filter(({email}) =>
    slackUsers.some((user) => user.profile.email === email)
  )

  await Promise.all(
    parabolMentions.map((user) =>
      reactions.map((reaction) =>
        pg
          .insertInto('UserInteractions')
          .values({
            createdById: parabolSender.id,
            receivedById: user.id,
            emoji: reaction.emoji,
            emojiName: reaction.name
          })
          .execute()
      )
    )
  )

  return true
}

export default slackMessage
