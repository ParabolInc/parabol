import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const removeAllSlackAuths: MutationResolvers['removeAllSlackAuths'] = async () => {
  const r = await getRethink()
  const now = new Date()

  // RESOLUTION
  const allSlackAuths = await r.table('SlackAuth').filter({isActive: true}).run()
  const allSlackAuthIds = allSlackAuths.map(({id}) => id)
  const [slackAuthRes, slackNotificationRes] = await Promise.all([
    r
      .table('SlackAuth')
      .getAll(r.args(allSlackAuthIds))
      .update({botAccessToken: null, isActive: false, updatedAt: now})
      .run(),
    r.table('SlackNotification').delete().run()
  ])
  const data = {
    slackAuthRes: JSON.stringify(slackAuthRes),
    slackNotificationRes: JSON.stringify(slackNotificationRes)
  }
  return data
}

export default removeAllSlackAuths
