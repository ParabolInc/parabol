import {sql} from 'kysely'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsAction from '../../../database/types/MeetingSettingsAction'
import MeetingSettingsPoker from '../../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import Team from '../../../database/types/Team'
import TimelineEventCreatedTeam from '../../../database/types/TimelineEventCreatedTeam'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import IUser from '../../../postgres/types/IUser'
import insertNewTeamMember from '../../../safeMutations/insertNewTeamMember'

interface ValidNewTeam {
  id: string
  name: string
  orgId: string
  isOnboardTeam: boolean
}

// used for addorg, addTeam
export default async function createTeamAndLeader(
  user: IUser,
  newTeam: ValidNewTeam,
  dataLoader: DataLoaderInstance
) {
  const r = await getRethink()
  const {id: userId, picture, preferredName, email} = user
  const {id: teamId, orgId} = newTeam
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {tier, trialStartDate} = organization
  const verifiedTeam = new Team({...newTeam, createdBy: userId, tier, trialStartDate})
  const meetingSettings = [
    new MeetingSettingsRetrospective({teamId}),
    new MeetingSettingsAction({teamId}),
    new MeetingSettingsPoker({teamId})
  ]
  const timelineEvent = new TimelineEventCreatedTeam({
    createdAt: new Date(Date.now() + 5),
    userId,
    teamId,
    orgId
  })

  const pg = getKysely()
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
          picture,
          preferredName,
          email,
          isLead: true,
          openDrawer: 'manageTeam'
        })
      )
      .insertInto('TimelineEvent')
      .values(timelineEvent)
      .execute(),
    // add meeting settings
    r.table('MeetingSettings').insert(meetingSettings).run(),
    // denormalize common fields to team member
    insertNewTeamMember(user, teamId, dataLoader)
  ])
}
