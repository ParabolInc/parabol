import getRethink from '../../../database/rethinkDriver'
import {isSuperUser} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const slackMessage: MutationResolvers['slackMessage'] = async (
  _source,
  {text, username, channel, mentions},
  {authToken}
) => {
  const r = await getRethink()
  const now = new Date()

  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // VALIDATION
  console.log('GEORG mutation', text, username, channel, mentions)
  return true
}

export default slackMessage
