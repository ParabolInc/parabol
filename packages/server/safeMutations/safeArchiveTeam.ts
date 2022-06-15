import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import {DataLoaderWorker} from '../graphql/graphql'
import archiveTeamsByTeamIds from '../postgres/queries/archiveTeamsByTeamIds'
import removeUserTms from '../postgres/queries/removeUserTms'

const safeArchiveTeam = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
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
        .filter({teamId})
        .update(
          {
            removedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([]) as unknown as string[]
    }).run(),
    archiveTeamsByTeamIds(teamId)
  ])

  return {...rethinkResult, team: pgResult[0] ?? null, users}
}

export default safeArchiveTeam
