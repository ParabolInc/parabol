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
  const [rethinkResult, removedSuggestedActions, team] = await Promise.all([
    r({
      invitations: r
        .table('TeamInvitation')
        .getAll(teamId, {index: 'teamId'})
        .filter({acceptedAt: null})
        .update((invitation: RDatum) => ({
          expiresAt: r.min([invitation('expiresAt'), now])
        })) as unknown as null
    }).run(),
    pg
      .updateTable('SuggestedAction')
      .set({removedAt: now})
      .where('teamId', '=', teamId)
      .returning('id')
      .execute(),
    pg
      .updateTable('Team')
      .set({isArchived: true})
      .where('id', '=', teamId)
      .returningAll()
      .executeTakeFirst(),
    pg
      .updateTable('User')
      .set(({fn, ref, val}) => ({tms: fn('ARRAY_REMOVE', [ref('tms'), val(teamId)])}))
      .where('id', 'in', userIds)
      .execute()
  ])
  dataLoader.clearAll(['teamMembers', 'users', 'teams'])
  const users = await Promise.all(userIds.map((userId) => dataLoader.get('users').load(userId)))
  return {
    invitations: rethinkResult.invitations,
    removedSuggestedActionIds: removedSuggestedActions.map(({id}) => id),
    team: team ?? null,
    users
  }
}

export default safeArchiveTeam
