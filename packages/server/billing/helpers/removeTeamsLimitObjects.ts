import {DataLoaderWorker} from '../../graphql/graphql'
import updateNotification from '../../graphql/public/mutations/helpers/updateNotification'
import getKysely from '../../postgres/getKysely'

const removeTeamsLimitObjects = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}

  const removeJobTypes = ['LOCK_ORGANIZATION', 'WARN_ORGANIZATION'] as const
  const removeNotificationTypes = ['TEAMS_LIMIT_EXCEEDED', 'TEAMS_LIMIT_REMINDER'] as const
  const pg = getKysely()

  // Remove team limits jobs and existing notifications
  const updateNotificationsChanges = await pg
    .with('ScheduledJobDelete', (qb) =>
      qb.deleteFrom('ScheduledJob').where('orgId', '=', orgId).where('type', 'in', removeJobTypes)
    )
    .updateTable('Notification')
    .set({status: 'CLICKED'})
    .where('orgId', '=', orgId)
    .where('type', 'in', removeNotificationTypes)
    .returning(['id', 'userId'])
    .execute()

  updateNotificationsChanges?.forEach((change) => {
    updateNotification(change, subOptions)
  })
}

export default removeTeamsLimitObjects
