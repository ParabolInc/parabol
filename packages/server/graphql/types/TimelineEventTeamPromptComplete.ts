import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Team from './Team'
import TeamPromptMeeting from './TeamPromptMeeting'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'

const TimelineEventTeamPromptComplete = new GraphQLObjectType<any>({
  name: 'TimelineEventTeamPromptComplete',
  description: 'An event for a completed team prompt meeting',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === 'TEAM_PROMPT_COMPLETE',
  fields: () => ({
    ...timelineEventInterfaceFields(),
    meeting: {
      type: new GraphQLNonNull(TeamPromptMeeting),
      description: 'The meeting that was completed',
      resolve: ({meetingId}: {meetingId: string}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meetingId that was completed'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId this event is associated with'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that can see this event',
      resolve: ({teamId}: {teamId: string}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId this event is associated with'
    }
  })
})

export default TimelineEventTeamPromptComplete
