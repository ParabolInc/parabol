import {sql} from 'kysely'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {MeetingSettingsThreshold} from '../../../../client/types/constEnums'
import Team from '../../../database/types/Team'
import TimelineEventCreatedTeam from '../../../database/types/TimelineEventCreatedTeam'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import IUser from '../../../postgres/types/IUser'

interface ValidNewTeam {
  id: string
  name: string
  orgId: string
  isOnboardTeam: boolean
  isPublic: boolean
}

// used for addorg, addTeam
export default async function createTeamAndLeader(
  user: IUser,
  newTeam: ValidNewTeam,
  dataLoader: DataLoaderInstance
) {
  const {id: userId} = user
  const {id: teamId, orgId, isPublic: requestedIsPublic} = newTeam
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {tier, trialStartDate} = organization

  const isPublic = tier === 'starter' ? true : requestedIsPublic

  const verifiedTeam = new Team({
    ...newTeam,
    createdBy: userId,
    tier,
    trialStartDate,
    isPublic
  })

  const timelineEvent = new TimelineEventCreatedTeam({
    createdAt: new Date(Date.now() + 5),
    userId,
    teamId,
    orgId
  })

  const pg = getKysely()
  const suggestedAction = {
    id: generateUID(),
    userId,
    teamId,
    type: 'inviteYourTeam' as const,
    priority: 2
  }
  await Promise.all([
    pg
      .with('TeamInsert', (qc) => qc.insertInto('Team').values(verifiedTeam))
      .with('UserUpdate', (qc) =>
        qc
          .updateTable('User')
          .set({tms: sql`arr_append_uniq("tms", ${teamId})`})
          .where('id', '=', userId)
      )
      .with('TeamMemberInsert', (qc) =>
        qc.insertInto('TeamMember').values({
          id: TeamMemberId.join(teamId, userId),
          teamId,
          userId,
          isLead: true,
          openDrawer: 'manageTeam'
        })
      )
      .with('SuggestedActionInsert', (qc) =>
        qc
          .insertInto('SuggestedAction')
          .values(suggestedAction)
          .onConflict((oc) => oc.columns(['userId', 'type']).doNothing())
      )
      .with('MeetingSettingsInsert', (qc) =>
        qc.insertInto('MeetingSettings').values([
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
      )
      .insertInto('TimelineEvent')
      .values(timelineEvent)
      .execute()
  ])
  dataLoader.clearAll(['teams', 'users', 'teamMembers', 'timelineEvents', 'meetingSettings'])
}
