import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import {useMakeStageSummaries_phase} from '../__generated__/useMakeStageSummaries_phase.graphql'

interface StageSummary {title: string, isComplete: boolean, isNavigable: boolean, isActive: boolean, sortOrder: number, stageIds: string[]}

const getTitleFromStory = (service: string, story: useMakeStageSummaries_phase['stages'][0]['story'], fallback = 'Unknown Story') => {
  if (!story) return fallback
  if (service === 'jira') return story.summary ?? fallback
  return story.plaintextContent?.split('\n')[0] ?? fallback
}

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
          serviceTaskId
          service
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
      const {serviceTaskId, service, story} = stage
      const batch = [stage]
      for (let j = i + 1; j < stages.length; j++) {
        const nextStage = stages[j]
        if (nextStage.serviceTaskId !== serviceTaskId) break
        batch.push(nextStage)
      }
      summaries.push({
        title: getTitleFromStory(service, story),
        isComplete: batch.every(({isComplete}) => isComplete),
        isNavigable: batch.some(({isNavigable}) => isNavigable),
        isActive: !!batch.find(({id}) => id === localStageId),
        sortOrder: stage.sortOrder,
        stageIds: batch.map(({id}) => id)
      })
      serviceTaskSet.add(serviceTaskId)
      i += batch.length - 1
    }
    return summaries
  }, [phaseRef, localStageId])
}

export default useMakeStageSummaries
