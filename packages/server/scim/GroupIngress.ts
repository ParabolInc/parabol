import SCIMMY from 'scimmy'
import {MeetingSettingsThreshold} from '../../client/types/constEnums'
import Team from '../database/types/Team'
import generateUID from '../generateUID'
import {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import createTeamAndLeader from '../graphql/mutations/helpers/createTeamAndLeader'
import removeTeamMember from '../graphql/mutations/helpers/removeTeamMember'
import {USER_PREFERRED_NAME_LIMIT} from '../postgres/constants'
import getKysely from '../postgres/getKysely'
import acceptTeamInvitation from '../safeMutations/acceptTeamInvitation'
import {Logger} from '../utils/Logger'
import {logSCIMRequest} from './logSCIMRequest'
import {mapGroupToSCIM} from './mapToSCIM'
import {reservedUserIds} from './reservedIds'
import {SCIMContext} from './SCIMContext'

const createEmptyTeam = async (team: Team) => {
  const pg = getKysely()
  const {id: teamId} = team

  await pg
    .with('TeamInsert', (qc) => qc.insertInto('Team').values(team))
    .insertInto('MeetingSettings')
    .values([
      {
        id: generateUID(),
        teamId,
        meetingType: 'retrospective',
        phaseTypes: ['checkin', 'TEAM_HEALTH', 'reflect', 'group', 'vote', 'discuss'],
        disableAnonymity: false,
        maxVotesPerGroup: MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT,
        totalVotes: MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
        selectedTemplateId: 'workingStuckTemplate'
      },
      {
        id: generateUID(),
        teamId,
        meetingType: 'action',
        phaseTypes: ['checkin', 'updates', 'firstcall', 'agendaitems', 'lastcall']
      },
      {
        id: generateUID(),
        teamId,
        meetingType: 'poker',
        phaseTypes: ['checkin', 'SCOPE', 'ESTIMATE'],
        selectedTemplateId: 'estimatedEffortTemplate'
      }
    ])
    .execute()
}

const applyMembers = async (group: SCIMMY.Schemas.Group, dataLoader: DataLoaderWorker) => {
  const members = group.members || []
  if (members.length > 100) {
    throw new SCIMMY.Types.Error(400, 'invalidValue', 'Too many members')
  }

  const [team, existingMembers] = await Promise.all([
    dataLoader.get('teams').load(group.id),
    dataLoader.get('teamMembersByTeamId').load(group.id)
  ])
  if (!team) {
    throw new SCIMMY.Types.Error(404, '', 'Team not found')
  }
  const toAdd = members.filter((member) => !existingMembers.some((m) => m.userId === member.value))
  const toRemove = existingMembers.filter(
    (m) => !members!.some((member) => member.value === m.userId)
  )

  if (existingMembers.length === 0 && toAdd.length > 0) {
    // If there are no existing members, we need to add the first one as lead
    // We also unarchive the team, because empty teams are always archived
    const teamLead = toAdd.shift()!
    await acceptTeamInvitation(team, teamLead.value, dataLoader, true)
    const pg = getKysely()
    await pg.updateTable('Team').set({isArchived: false}).where('id', '=', team.id).execute()
  }

  await Promise.all(
    toRemove.map(async (member) => {
      const res = await removeTeamMember(member.id, {}, dataLoader)
      if (!res.user) {
        Logger.error(`Failed to remove team member ${member.id} from team ${group.id}`)
      }
    })
  )

  await Promise.all(
    toAdd.map(async (member) => {
      try {
        await acceptTeamInvitation(team, member.value, dataLoader)
      } catch (e) {
        Logger.error(`Failed to add user ${member.value} to team ${group.id}: ${e}`)
      }
    })
  )

  dataLoader.get('teamMembersByTeamId').clear(group.id)
  return group
}

SCIMMY.Resources.declare(SCIMMY.Resources.Group).ingress(
  async (resource, instance, context: SCIMContext) => {
    const {ip, authToken, dataLoader} = context
    const scimId = authToken.sub!

    const {id: teamId} = resource

    logSCIMRequest(scimId, ip, {operation: `Group ingress`, instance})
    if (reservedUserIds.includes(teamId ?? '')) {
      throw new SCIMMY.Types.Error(403, '', 'Forbidden')
    }

    const saml = await dataLoader.get('saml').loadNonNull(scimId)
    const {orgId} = saml
    if (!orgId) {
      throw new SCIMMY.Types.Error(403, '', 'No organization associated with this SCIM')
    }

    const {displayName, members} = instance
    if (displayName && displayName.length > USER_PREFERRED_NAME_LIMIT) {
      throw new SCIMMY.Types.Error(400, 'invalidValue', 'displayName is too long')
    }

    const pg = getKysely()
    const existingTeam = await pg
      .selectFrom('Team')
      .selectAll()
      .where('orgId', '=', orgId)
      .where('name', 'ilike', displayName ?? '')
      .where((eb) => eb.or([eb('isArchived', '=', false), eb('scimCreated', '=', true)]))
      .executeTakeFirst()

    if (existingTeam && existingTeam.id !== teamId) {
      throw new SCIMMY.Types.Error(409, 'uniqueness', 'Team with this name already exists')
    }

    if (teamId) {
      // updating existing team

      const team = await dataLoader.get('teams').load(teamId)
      if (!team || team.orgId !== orgId) {
        throw new SCIMMY.Types.Error(404, '', 'Group not found')
      }

      try {
        const updatedTeam = await pg
          .updateTable('Team')
          .set({
            name: displayName
          })
          .where('id', '=', teamId)
          .returningAll()
          .executeTakeFirst()
        if (!updatedTeam) {
          throw new SCIMMY.Types.Error(412, '', 'User update failed')
        }
        await applyMembers({...instance, id: teamId}, dataLoader)
        return mapGroupToSCIM(updatedTeam, dataLoader)
      } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === '23505') {
          throw new SCIMMY.Types.Error(409, 'uniqueness', 'Team exists')
        }
        Logger.error(e)
        throw new SCIMMY.Types.Error(500, '', 'Internal server error')
      }
    } else {
      // new team
      if (!displayName) {
        throw new SCIMMY.Types.Error(400, 'invalidValue', 'displayName is required')
      }
      const users = (
        await dataLoader.get('users').loadMany(members?.map((m) => m.value) ?? [])
      ).filter(isValid)

      try {
        const teamId = generateUID()
        const validNewTeam = {
          id: teamId,
          orgId,
          name: displayName,
          isOnboardTeam: false,
          isPublic: false,
          scimCreated: true
        }
        const teamLead = users[0]
        if (!teamLead) {
          // We need a lead, but SCIM usually starts by provisioning empty groups
          // Let's create an empty team for now. To not break any GraphQL assumptions about a lead always being present,
          // we'll create it as archived and allow patching archived teams by id.
          await createEmptyTeam(
            new Team({
              ...validNewTeam,
              isArchived: true,
              createdAt: new Date(),
              isPublic: false,
              isOnboardTeam: false,
              createdBy: 'aGhostUser'
            })
          )
        } else {
          await createTeamAndLeader(teamLead, validNewTeam, dataLoader)
          await applyMembers({...instance, id: teamId}, dataLoader)
        }

        return mapGroupToSCIM(validNewTeam, dataLoader)
      } catch (error) {
        Logger.error('Failed to create team for SCIM group', {displayName, error})
        throw new SCIMMY.Types.Error(500, '', 'Internal server error')
      }
    }
  }
)
