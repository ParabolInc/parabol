import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsAction from '../../../database/types/MeetingSettingsAction'
import MeetingSettingsPoker from '../../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import Team from '../../../database/types/Team'
import TimelineEventCreatedTeam from '../../../database/types/TimelineEventCreatedTeam'
import getPg from '../../../postgres/getPg'
import {insertTeamQuery} from '../../../postgres/queries/generated/insertTeamQuery'
import IUser from '../../../postgres/types/IUser'
import catchAndLog from '../../../postgres/utils/catchAndLog'
import addTeamIdToTMS from '../../../safeMutations/addTeamIdToTMS'
import insertNewTeamMember from '../../../safeMutations/insertNewTeamMember'

interface ValidNewTeam {
  id: string
  name: string
  orgId: string
  isOnboardTeam: boolean
}

// used for addorg, addTeam
export default async function createTeamAndLeader(user: IUser, newTeam: ValidNewTeam) {
  const r = await getRethink()
  const {id: userId} = user
  const {id: teamId, orgId} = newTeam
  const organization = await r.table('Organization').get(orgId).run()
  const {tier} = organization
  const verifiedTeam = new Team({...newTeam, createdBy: userId, tier})
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

  await Promise.all([
    catchAndLog(() => insertTeamQuery.run(verifiedTeam, getPg())),
    // add meeting settings
    r.table('MeetingSettings').insert(meetingSettings).run(),
    // denormalize common fields to team member
    insertNewTeamMember(user, teamId),
    r.table('TimelineEvent').insert(timelineEvent).run(),
    addTeamIdToTMS(userId, teamId)
  ])
}
