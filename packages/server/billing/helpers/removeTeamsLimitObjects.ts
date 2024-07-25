import {r} from 'rethinkdb-ts'
import {RValue} from '../../database/stricterR'
import {DataLoaderWorker} from '../../graphql/graphql'
import updateNotification from '../../graphql/public/mutations/helpers/updateNotification'
import getKysely from '../../postgres/getKysely'

const removeTeamsLimitObjects = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const removeJobTypes = ['LOCK_ORGANIZATION', 'WARN_ORGANIZATION'] as const
  const removeNotificationTypes = ['TEAMS_LIMIT_EXCEEDED', 'TEAMS_LIMIT_REMINDER'] as const
  const pg = getKysely()

  // Remove team limits jobs and existing notifications
  const [, updateNotificationsChanges] = await Promise.all([
    pg
      .deleteFrom('ScheduledJob')
      .where('orgId', '=', orgId)
      .where('type', 'in', removeJobTypes)
      .execute(),
    r
      .table('Notification')
      .getAll(orgId, {index: 'orgId'})
      .filter((row: RValue) => r.expr(removeNotificationTypes).contains(row('type')))
      .update(
        // not really clicked, but no longer important
        {status: 'CLICKED'},
        {returnChanges: true}
      )('changes')
      .default([])
      .run()
  ])

  const operationId = dataLoader.share()
  const subOptions = {operationId}

  updateNotificationsChanges?.forEach((change) => {
    updateNotification(change.new_val, subOptions)
  })
}

export default removeTeamsLimitObjects
