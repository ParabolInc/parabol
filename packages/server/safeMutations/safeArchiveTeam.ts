import getRethink from '../database/rethinkDriver'
import Team from '../database/types/Team'
import db from '../db'

const safeArchiveTeam = async (teamId: string) => {
  const r = await getRethink()
  const now = new Date()
  const userIds = await r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isNotRemoved: true})('userId')
    .run()
  const users = await db.writeMany('User', userIds, (user) => ({
    tms: user('tms').difference([teamId])
  }))
  const result = await r({
    team: (r
      .table('Team')
      .get(teamId)
      .update(
        {isArchived: true},
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null) as unknown) as Team | null,
    invitations: (r
      .table('TeamInvitation')
      .getAll(teamId, {index: 'teamId'})
      .filter({acceptedAt: null})
      .update((invitation) => ({
        expiresAt: r.min([invitation('expiresAt'), now])
      })) as unknown) as null,
    removedSuggestedActionIds: (r
      .table('SuggestedAction')
      .filter({teamId})
      .update(
        {
          removedAt: now
        },
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([]) as unknown) as string[]
  }).run()
  return {...result, users}
}

export default safeArchiveTeam
