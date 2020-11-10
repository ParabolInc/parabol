import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import {useMakeStageSummaries_phase} from '../__generated__/useMakeStageSummaries_phase.graphql'

interface StageSummary {title: string, isComplete: boolean, isNavigable: boolean, isActive: boolean, sortOrder: number, stageIds: string[]}

const useMakeStageSummaries = (phaseRef: any, localStageId: string) => {
  const estimatePhase = readInlineData<useMakeStageSummaries_phase>(
    graphql`
      fragment useMakeStageSummaries_phase on EstimatePhase @inline {
        phaseType
        stages {
          id
          isComplete
          isNavigable
          sortOrder
          story {
            id
            ... on JiraIssue {
              summary
            }
            ... on Task {
              plaintextContent
            }
          }
        }
      }
    `,
    phaseRef
  )
  return useMemo(() => {
    const {stages} = estimatePhase
    const serviceTaskSet = new Set<string>()
    const summaries = [] as StageSummary[]
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      const {story} = stage
      const {id: storyId} = story
      const batch = [stage]
      for (let j = i + 1; j < stages.length; j++) {
        const nextStage = stages[j]
        if (nextStage.story.id !== storyId) break
        batch.push(nextStage)
      }
      summaries.push({
        title: story.plaintextContent?.split('\n')[0] || story.summary || 'Unknown story',
        isComplete: batch.every(({isComplete}) => isComplete),
        isNavigable: batch.some(({isNavigable}) => isNavigable),
        isActive: !!batch.find(({id}) => id === localStageId),
        sortOrder: stage.sortOrder,
        stageIds: batch.map(({id}) => id)
      })
      serviceTaskSet.add(storyId)
      i += batch.length - 1
    }
    return summaries
  }, [phaseRef, localStageId])
}

export default useMakeStageSummaries
