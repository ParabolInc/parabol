import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import type {PokerSidebarStoryTitle_task$key} from '../__generated__/PokerSidebarStoryTitle_task.graphql'
import type {useMakeStageSummaries_phase$key} from '../__generated__/useMakeStageSummaries_phase.graphql'

interface StageSummary {
  title: string
  integratedTask: PokerSidebarStoryTitle_task$key | null
  isComplete: boolean
  isNavigable: boolean
  isActive: boolean
  stageIds: [string, ...string[]]
  finalScores: (string | null)[]
  taskId: string
}

graphql`
  fragment useMakeStageSummaries_stages on EstimateStage @relay(plural: true) {
    id
    finalScore
    isComplete
    isNavigable
    taskId
    task {
      title
      integrationHash
      ...PokerSidebarStoryTitle_task @defer
    }
  }
`

const useMakeStageSummaries = (
  phaseRef: useMakeStageSummaries_phase$key | null | undefined,
  localStageId: string
) => {
  const estimatePhase = readInlineData(
    graphql`
      fragment useMakeStageSummaries_phase on EstimatePhase @inline {
        phaseType
        stages {
          ...useMakeStageSummaries_stages @relay(mask: false)
        }
      }
    `,
    phaseRef
  )
  return useMemo(() => {
    const summaries = [] as StageSummary[]
    if (!estimatePhase) return summaries
    const {stages} = estimatePhase
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]!
      const {taskId, task} = stage
      const batch = [stage]
      for (let j = i + 1; j < stages.length; j++) {
        const nextStage = stages[j]
        if (nextStage?.taskId !== taskId) break
        batch.push(nextStage)
      }
      summaries.push({
        title: task?.title ?? '<Unknown Story>',
        integratedTask: task?.integrationHash ? task : null,
        isComplete: batch.every(({isComplete}) => isComplete),
        isNavigable: batch.some(({isNavigable}) => isNavigable),
        isActive: !!batch.find(({id}) => id === localStageId),
        stageIds: batch.map(({id}) => id) as [string, ...string[]],
        finalScores: batch.map(({finalScore}) => finalScore || null),
        taskId
      })
      i += batch.length - 1
    }
    return summaries
  }, [phaseRef, localStageId])
}

export default useMakeStageSummaries
