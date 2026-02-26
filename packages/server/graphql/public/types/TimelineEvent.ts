import type {TimelineEventResolvers} from '../resolverTypes'

const TimelineEvent: TimelineEventResolvers = {
  __resolveType: ({type}) => {
    const lookup = {
      createdTeam: 'TimelineEventTeamCreated',
      joinedParabol: 'TimelineEventJoinedParabol',
      retroComplete: 'TimelineEventCompletedRetroMeeting',
      actionComplete: 'TimelineEventCompletedActionMeeting',
      POKER_COMPLETE: 'TimelineEventPokerComplete',
      TEAM_PROMPT_COMPLETE: 'TimelineEventTeamPromptComplete'
    } as const
    return lookup[type as keyof typeof lookup]
  },
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default TimelineEvent
