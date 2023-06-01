import TeamHealthUserScoreId from 'parabol-client/shared/gqlIds/TeamHealthUserScoreId'
import {TeamHealthUserScoreResolvers} from '../resolverTypes'

const TeamHealthUserScore: TeamHealthUserScoreResolvers = {
  id: ({stageId, userId}) => {
    return TeamHealthUserScoreId.join(stageId, userId)
  },
  user: ({userId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('users').load(userId)
  }
}

export default TeamHealthUserScore
