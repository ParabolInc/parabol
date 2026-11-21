import type {DataLoaderWorker} from '../../../server/graphql/graphql'
import canAccessAI from '../../../server/graphql/mutations/helpers/canAccessAI'
import loadTeamBriefing from '../../../server/utils/loadTeamBriefing'
import OpenAIServerManager from '../../../server/utils/OpenAIServerManager'

interface SimilarDiscussion {
  embeddingsMetadataId: number
  similarity: number
}

/**
 * Narrows the past topics closest in wording to the ones about the same issue. Wording alone links
 * topics that only share a theme, so an AI that knows the team's projects and jargon, and when each
 * topic was discussed, makes the call. Without AI, or when it fails, the closest ones stand.
 */
const pickRelatedDiscussions = async (
  teamId: string,
  topic: string,
  candidates: SimilarDiscussion[],
  maxPicks: number,
  dataLoader: DataLoaderWorker
) => {
  const closest = candidates.slice(0, maxPicks)
  if (candidates.length === 0) return closest
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader))) return closest
  const [teamBriefing, pastTopics] = await Promise.all([
    loadTeamBriefing(teamId, dataLoader),
    Promise.all(
      candidates.map(async ({embeddingsMetadataId}) => {
        const {refId, fullText} = await dataLoader
          .get('embeddingsMetadata')
          .loadNonNull(embeddingsMetadataId)
        const {createdAt} = await dataLoader.get('discussions').loadNonNull(refId)
        return {discussedAt: createdAt, text: fullText ?? ''}
      })
    )
  ])
  const picks = await new OpenAIServerManager().pickRelatedDiscussions(
    topic,
    pastTopics,
    maxPicks,
    teamBriefing
  )
  return picks ? picks.map((index) => candidates[index]!) : closest
}

export default pickRelatedDiscussions
