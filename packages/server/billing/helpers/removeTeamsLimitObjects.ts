import {r} from 'rethinkdb-ts'
import {RValue} from '../../database/stricterR'
import {DataLoaderWorker} from '../../graphql/graphql'
import unpublishNotification from '../../graphql/public/mutations/helpers/unpublishNotification'

const removeTeamsLimitObjects = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const removeJobTypes = ['LOCK_ORGANIZATION', 'WARN_ORGANIZATION']
  const removeNotificationTypes = ['TEAMS_LIMIT_EXCEEDED', 'TEAMS_LIMIT_REMINDER']

  // Remove team limits jobs and existing notifications
  const [, deleteNotificationsChanges] = await Promise.all([
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
      .delete({returnChanges: true})('changes')
      .run()
  ])

  const operationId = dataLoader.share()
  const subOptions = {operationId}

  deleteNotificationsChanges?.forEach((change) => {
    const {id, userId} = change.old_val
    unpublishNotification(id, userId, subOptions)
  })
}

export default removeTeamsLimitObjects
