import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const removeAllSlackAuths: MutationResolvers['removeAllSlackAuths'] = async () => {
  const pg = getKysely()
  // RESOLUTION
  const [slackAuthRes, slackNotificationRes] = await Promise.all([
    pg
      .updateTable('SlackAuth')
      .set({botAccessToken: null, isActive: false})
      .returning('id')
      .execute(),
    sql`TRUNCATE TABLE "SlackNotification"`.execute(pg)
  ])
  const data = {
    slackAuthRes: JSON.stringify(slackAuthRes),
    slackNotificationRes: JSON.stringify(slackNotificationRes)
  }
  return data
}

export default removeAllSlackAuths
