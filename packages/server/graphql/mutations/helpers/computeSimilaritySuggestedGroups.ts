import {GraphQLError} from 'graphql'
import type {AutogroupReflectionGroupType} from '../../../postgres/types'
import clusterBySimilarity from '../../../utils/smartGroup/clusterBySimilarity'
import type {SimilarityGroup} from '../../../utils/smartGroup/similarityMath'
import type {DataLoaderWorker} from '../../graphql'

/**
 * Clusters a retro's reflection groups by the cosine similarity of their embeddings.
 * The result is persisted as the meeting's suggested grouping, so the outline a user previews on
 * hover is exactly what applying produces. No LLM call, so this needs no AI entitlement.
 *
 * Throws a GraphQLError when it cannot produce an answer, so the client can surface the reason in
 * a snackbar. Nothing is persisted for a failed run.
 */
const computeSimilaritySuggestedGroups = async (
  meetingId: string,
  sameColumnOnly: boolean,
  dataLoader: DataLoaderWorker
): Promise<AutogroupReflectionGroupType[]> => {
  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  const vectors = await Promise.all(
    reflections.map((reflection) =>
      dataLoader.get('retroReflectionEmbeddingByReflectionId').load(reflection.id)
    )
  )
  const vectorByReflectionId = new Map(
    reflections.map((reflection, idx) => [reflection.id, vectors[idx] ?? null])
  )
  const embeddedCount = vectors.filter((vector) => !!vector?.length).length
  if (embeddedCount < 2) {
    throw new GraphQLError(
      "Grouping by similar wording isn't ready for this meeting yet. Try Custom Instructions, or group by dragging."
    )
  }

  const similarityGroups = reflectionGroups.map<SimilarityGroup>((group) => ({
    id: group.id,
    promptId: group.promptId,
    reflections: reflections
      .filter(({reflectionGroupId}) => reflectionGroupId === group.id)
      .map(({id}) => ({id, embeddingVector: vectorByReflectionId.get(id)}))
  }))

  const clusters = clusterBySimilarity(similarityGroups, {sameColumnOnly})
  // No title: addReflectionToGroup falls through to updateGroupTitle, which names the merged
  // group with an AI title, or a Jaccard title when the org has AI turned off
  return clusters.map(({reflectionIds}) => ({
    groupTitle: '',
    reflectionIds: [...reflectionIds]
  }))
}

export default computeSimilaritySuggestedGroups
