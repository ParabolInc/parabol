import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import makeMutationPayload from './makeMutationPayload'
import Team from './Team'
import TeamPromptMeeting from './TeamPromptMeeting'
import TimelineEvent from './TimelineEvent'

export const EndTeamPromptSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndTeamPromptSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(TeamPromptMeeting),
      resolve: resolveNewMeeting
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: resolveTeam
    },
    timelineEvent: {
      type: new GraphQLNonNull(TimelineEvent),
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({timelineEventId}, _args: unknown, {dataLoader}) => {
        return await dataLoader.get('timelineEvents').load(timelineEventId)
      }
    }
  })
})

const EndTeamPromptPayload = makeMutationPayload('EndTeamPromptPayload', EndTeamPromptSuccess)

export default EndTeamPromptPayload
