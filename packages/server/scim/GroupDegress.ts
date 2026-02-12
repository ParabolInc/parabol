import SCIMMY from 'scimmy'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import removeMeetingTemplatesForTeam from '../postgres/queries/removeMeetingTemplatesForTeam'
import safeArchiveTeam from '../safeMutations/safeArchiveTeam'
import {Logger} from '../utils/Logger'
import {logSCIMRequest} from './logSCIMRequest'
import {reservedUserIds} from './reservedIds'
import {SCIMContext} from './SCIMContext'

SCIMMY.Resources.declare(SCIMMY.Resources.Group).degress(async (resource, ctx: SCIMContext) => {
  const {ip, authToken, dataLoader} = ctx
  const scimId = authToken.sub!
  const {id: teamId} = resource

  logSCIMRequest(scimId, ip, {operation: `Group degress`})
  if (reservedUserIds.includes(teamId ?? '')) {
    throw new SCIMMY.Types.Error(403, '', 'Forbidden')
  }

  if (!teamId) {
    throw new SCIMMY.Types.Error(400, 'invalidValue', 'User ID is required for degress')
  }

  const [saml, team] = await Promise.all([
    dataLoader.get('saml').loadNonNull(scimId),
    dataLoader.get('teams').load(teamId)
  ])
  const {orgId} = saml

  if (!team || team.orgId !== orgId) {
    throw new SCIMMY.Types.Error(404, '', 'Team not found')
  }

  try {
    const {users} = await safeArchiveTeam(teamId, dataLoader)

    await dataLoader.get('meetingTemplatesByTeamId').load(teamId)
    await removeMeetingTemplatesForTeam(teamId)

    const notifications = users
      .map((user) => user?.id)
      .map((notifiedUserId) => ({
        id: generateUID(),
        type: 'TEAM_ARCHIVED' as const,
        userId: notifiedUserId!,
        teamId
      }))

    const pg = getKysely()
    if (notifications.length) {
      await pg.insertInto('Notification').values(notifications).execute()
    }

    await pg.updateTable('Team').set({scimCreated: false}).where('id', '=', teamId).execute()
  } catch (error) {
    Logger.error('Failed to degress team', {error, teamId})
    throw new SCIMMY.Types.Error(500, 'internalError', 'Failed to degress team')
  }
})
