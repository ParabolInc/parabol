import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'
import removeUserTms from '../postgres/queries/removeUserTms'

const safeArchiveTeam = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const userIds = await r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isNotRemoved: true})('userId')
    .run()
  await removeUserTms(teamId, userIds)
  const users = await Promise.all(userIds.map((userId) => dataLoader.get('users').load(userId)))
  const [rethinkResult, pgResult] = await Promise.all([
    r({
      invitations: r
        .table('TeamInvitation')
        .getAll(teamId, {index: 'teamId'})
        .filter({acceptedAt: null})
        .update((invitation: RDatum) => ({
          expiresAt: r.min([invitation('expiresAt'), now])
        })) as unknown as null,
      removedSuggestedActionIds: r
        .table('SuggestedAction')
        .getAll(teamId, {index: 'teamId'})
        .update(
          {
            removedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([]) as unknown as string[]
    }).run(),
    pg
      .updateTable('Team')
      .set({isArchived: true})
      .where('id', '=', teamId)
      .returningAll()
      .executeTakeFirst()
  ])

  return {...rethinkResult, team: pgResult ?? null, users}
}

export default safeArchiveTeam
