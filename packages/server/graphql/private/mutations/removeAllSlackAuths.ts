import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const removeAllSlackAuths: MutationResolvers['removeAllSlackAuths'] = async () => {
  const r = await getRethink()

  // RESOLUTION
  const [slackAuthRes, slackNotificationRes] = await Promise.all([
    getKysely()
      .updateTable('SlackAuth')
      .set({botAccessToken: null, isActive: false})
      .returning('id')
      .execute(),
    r.table('SlackNotification').delete().run()
  ])
  const data = {
    slackAuthRes: JSON.stringify(slackAuthRes),
    slackNotificationRes: JSON.stringify(slackNotificationRes)
  }
  return data
}

export default removeAllSlackAuths
