import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'

const safeArchiveTeam = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const userIds = teamMembers.map((tm) => tm.userId)
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
      .executeTakeFirst(),
    pg
      .updateTable('User')
      .set(({fn, ref, val}) => ({tms: fn('ARR_REMOVE', [ref('tms'), val(teamId)])}))
      .where('id', 'in', userIds)
      .execute()
  ])
  dataLoader.clearAll(['teamMembers', 'users', 'teams'])
  const users = await Promise.all(userIds.map((userId) => dataLoader.get('users').load(userId)))
  return {...rethinkResult, team: pgResult ?? null, users}
}

export default safeArchiveTeam
