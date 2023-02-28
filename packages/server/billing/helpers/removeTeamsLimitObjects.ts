import {r} from 'rethinkdb-ts'
import {RValue} from '../../database/stricterR'
import {DataLoaderWorker} from '../../graphql/graphql'
import updateNotification from '../../graphql/public/mutations/helpers/updateNotification'

const removeTeamsLimitObjects = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const removeJobTypes = ['LOCK_ORGANIZATION', 'WARN_ORGANIZATION']
  const removeNotificationTypes = ['TEAMS_LIMIT_EXCEEDED', 'TEAMS_LIMIT_REMINDER']

  // Remove team limits jobs and existing notifications
  const [, updateNotificationsChanges] = await Promise.all([
    r
      .table('ScheduledJob')
      .getAll(orgId, {index: 'orgId'})
      .filter((row: RValue) => r.expr(removeJobTypes).contains(row('type')))
      .delete()
      .run(),
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
