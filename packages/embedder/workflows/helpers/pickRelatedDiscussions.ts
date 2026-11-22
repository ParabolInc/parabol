import type {DataLoaderWorker} from '../../../server/graphql/graphql'
import canAccessAI from '../../../server/graphql/mutations/helpers/canAccessAI'
import loadTeamBriefing from '../../../server/utils/loadTeamBriefing'
import OpenAIServerManager from '../../../server/utils/OpenAIServerManager'

interface SimilarDiscussion {
  embeddingsMetadataId: number
  similarity: number
}

const pickRelatedDiscussions = async (
  teamId: string,
  topic: string,
  candidates: SimilarDiscussion[],
  maxPicks: number,
  dataLoader: DataLoaderWorker
) => {
  if (candidates.length === 0) return []
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader))) return null
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
  return picks?.map((index) => candidates[index]!) ?? null
}

export default pickRelatedDiscussions
