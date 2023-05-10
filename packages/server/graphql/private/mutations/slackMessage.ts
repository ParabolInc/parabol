import getKysely from '../../../postgres/getKysely'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {isSuperUser} from '../../../utils/authorization'
import SlackServerManager from '../../../utils/SlackServerManager'
import {MutationResolvers} from '../resolverTypes'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

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
  {sender, mentions, emojis},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

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

  const interactionInserts = parabolMentions.flatMap((user) =>
    reactions.map((reaction) => ({
      createdById: parabolSender.id,
      receivedById: user.id,
      emoji: reaction.emoji,
      emojiName: reaction.name
    }))
  )

  const inserted = await pg.insertInto('UserInteractions').values(interactionInserts).execute()
  const interactions = inserted.map((row, i) => ({
    id: row.insertId,
    ...interactionInserts[i]
  }))

  parabolSender.tms.forEach((teamId) => {
    const mentionedMateIds = parabolMentions
      .filter((user) => user.tms.includes(teamId))
      .map(({id}) => id)
    if (mentionedMateIds.length) {
      const userInteractions = interactions.filter(({receivedById}) =>
        mentionedMateIds.includes(receivedById)
      )
      const data = {
        userInteractions
      }
      publish(SubscriptionChannel.TEAM, teamId, 'UserInteractionSuccess', data, subOptions)
    }
  })

  return true
}

export default slackMessage
