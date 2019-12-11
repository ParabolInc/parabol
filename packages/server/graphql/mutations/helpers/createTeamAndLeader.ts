import getRethink from '../../../database/rethinkDriver'
import insertNewTeamMember from '../../../safeMutations/insertNewTeamMember'
import shortid from 'shortid'
import makeRetroTemplates from './makeRetroTemplates'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import addTeamIdToTMS from '../../../safeMutations/addTeamIdToTMS'
import {CREATED_TEAM} from '../../types/TimelineEventTypeEnum'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import Team from '../../../database/types/Team'
import Organization from '../../../database/types/Organization'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import MeetingSettingsAction from '../../../database/types/MeetingSettingsAction'

interface ValidNewTeam {
  id: string
  name: string
  orgId: string
  isOnboardTeam: boolean
}

// used for addorg, addTeam
export default async function createTeamAndLeader(userId: string, newTeam: ValidNewTeam) {
  const r = await getRethink()
  const {id: teamId, orgId} = newTeam
  const organization = await r
    .table<Organization>('Organization')
    .get(orgId)
    .run()
  const {tier} = organization
  const verifiedTeam = new Team({...newTeam, createdBy: userId, tier})
  const {phaseItems, templates} = makeRetroTemplates(teamId)
  const meetingSettings = [
    new MeetingSettingsRetrospective({teamId, selectedTemplateId: templates[0].id}),
    new MeetingSettingsAction({teamId})
  ]

  const [organizationUser] = await Promise.all([
    r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null, orgId})
      .nth(0)
      .default(null)
      .run(),
    // insert team
    r
      .table('Team')
      .insert(verifiedTeam, {returnChanges: true})('changes')(0)('new_val')
      .default(null)
      .run(),
    // add meeting settings
    r
      .table('MeetingSettings')
      .insert(meetingSettings)
      .run(),
    // add customizable phase items for meetings
    r
      .table('CustomPhaseItem')
      .insert(phaseItems)
      .run(),
    r
      .table('ReflectTemplate')
      .insert(templates)
      .run(),
    // denormalize common fields to team member
    insertNewTeamMember(userId, teamId),
    r
      .table('TimelineEvent')
      .insert({
        id: shortid.generate(),
        // + 5 to make sure it comes after parabol joined event
        createdAt: new Date(Date.now() + 5),
        interactionCount: 0,
        seenCount: 0,
        type: CREATED_TEAM,
        userId,
        teamId,
        orgId
      })
      .run(),
    addTeamIdToTMS(userId, teamId)
  ])

  if (!organizationUser) {
    await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER)
  }

  const tms = await r
    .table('User')
    .get(userId)('tms')
    .run()
}
