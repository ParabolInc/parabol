import getRethink from '../database/rethinkDriver'
import User from '../database/types/User'

const safeArchiveTeam = async (teamId: string) => {
  const r = await getRethink()
  const now = new Date()

  return r({
    team: r
      .table('Team')
      .get(teamId)
      .update(
        {isArchived: true},
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null),
    users: (r
      .table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({isNotRemoved: true})('userId')
      .coerceTo('array')
      .do((userIds) => {
        return r
          .table('User')
          .getAll(r.args(userIds), {index: 'id'})
          .update((user) => ({tms: user('tms').difference([teamId])}), {
            returnChanges: true
          })('changes')('new_val')
          .default([])
      }) as unknown) as User[],
    invitations: r
      .table('TeamInvitation')
      .getAll(teamId, {index: 'teamId'})
      .filter({acceptedAt: null})
      .update((invitation) => ({
        expiresAt: r.min([invitation('expiresAt'), now])
      })),
    removedSuggestedActionIds: r
      .table('SuggestedAction')
      .filter({teamId})
      .update(
        {
          removedAt: now
        },
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([])
  }).run()
}

export default safeArchiveTeam
