import {isSuperUser} from '../../../utils/authorization'
import SlackServerManager from '../../../utils/SlackServerManager'
import {MutationResolvers} from '../resolverTypes'

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN

const slackMessage: MutationResolvers['slackMessage'] = async (
  _source,
  {text, mentions}, //username, channel, mentions},
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
  const slackUsers = await Promise.all(mentions.map((userId) => manager.getUserInfo(userId)))

  const userEmails = slackUsers
    .map((user) => ('user' in user ? user.user.profile.email : null))
    .filter((email) => !!email)

  console.log('GEORG mutation', text, userEmails)
  return true
}

export default slackMessage
