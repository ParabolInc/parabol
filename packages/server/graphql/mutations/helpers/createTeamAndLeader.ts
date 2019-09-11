import getRethink from '../../../database/rethinkDriver'
import {updateAuth0TMS} from '../../../utils/auth0Helpers'
import {
  ACTION,
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  RETROSPECTIVE,
  RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT,
  RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
  UPDATES,
  VOTE
} from '../../../../client/utils/constants'
import insertNewTeamMember from '../../../safeMutations/insertNewTeamMember'
import shortid from 'shortid'
import makeRetroTemplates from './makeRetroTemplates'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import addTeamIdToTMS from '../../../safeMutations/addTeamIdToTMS'
import {CREATED_TEAM} from '../../types/TimelineEventTypeEnum'
import {InvoiceItemType} from 'parabol-client/types/constEnums'

// used for addorg, addTeam
export default async function createTeamAndLeader(userId, newTeam) {
  const r = getRethink()
  const now = new Date()
  const {id: teamId, orgId} = newTeam
  const organization = await r.table('Organization').get(orgId)
  const {tier} = organization
  const verifiedTeam = {
    ...newTeam,
    createdAt: now,
    createdBy: userId,
    isArchived: false,
    isPaid: true,
    meetingId: null,
    tier
  }
  const {phaseItems, templates} = makeRetroTemplates(teamId)
  const meetingSettings = [
    {
      id: shortid.generate(),
      meetingType: RETROSPECTIVE,
      teamId,
      phaseTypes: [CHECKIN, REFLECT, GROUP, VOTE, DISCUSS],
      selectedTemplateId: templates[0].id,
      totalVotes: RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
      maxVotesPerGroup: RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
    },
    {
      id: shortid.generate(),
      meetingType: ACTION,
      teamId,
      phaseTypes: [CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL]
    }
  ]

  const res = await r({
    // insert team
    team: r
      .table('Team')
      .insert(verifiedTeam, {returnChanges: true})('changes')(0)('new_val')
      .default(null),
    // add meeting settings
    teamSettings: r.table('MeetingSettings').insert(meetingSettings),
    // add customizable phase items for meetings
    customPhaseItems: r.table('CustomPhaseItem').insert(phaseItems),
    templates: r.table('ReflectTemplate').insert(templates),
    // denormalize common fields to team member
    teamLead: insertNewTeamMember(userId, teamId, {
      isLead: true,
      checkInOrder: 0
    }),
    event: r.table('TimelineEvent').insert({
      id: shortid.generate(),
      // + 5 to make sure it comes after parabol joined event
      createdAt: new Date(Date.now() + 5),
      interactionCount: 0,
      seenCount: 0,
      type: CREATED_TEAM,
      userId,
      teamId,
      orgId
    }),
    // add teamId to user tms array
    user: addTeamIdToTMS(userId, teamId),
    organizationUser: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null, orgId})
      .nth(0)
      .default(null)
  })

  const {organizationUser} = res
  if (!organizationUser) {
    await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER)
  }

  const tms = await r.table('User').get(userId)('tms')
  updateAuth0TMS(userId, tms)
}
