import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import type {useMakeStageSummaries_phase$key} from '../__generated__/useMakeStageSummaries_phase.graphql'

interface StageSummary {
  title: string
  subtitle: string
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
      integration {
        ... on AzureDevOpsWorkItem {
          __typename
          title
          id
        }
        ... on JiraIssue {
          __typename
          title
          issueKey
        }
        ... on JiraServerIssue {
          __typename
          title
          issueKey
        }
        ... on _xGitHubIssue {
          __typename
          title
          number
        }
        ... on _xGitLabIssue {
          __typename
          title
          iid
        }
        ... on _xLinearIssue {
          __typename
          title
          identifier
        }
      }
    }
  }
`

const useMakeStageSummaries = (phaseRef: useMakeStageSummaries_phase$key, localStageId: string) => {
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
    const {stages} = estimatePhase
    const summaries = [] as StageSummary[]
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]!
      const {taskId, task} = stage
      const batch = [stage]
      for (let j = i + 1; j < stages.length; j++) {
        const nextStage = stages[j]
        if (nextStage?.taskId !== taskId) break
        batch.push(nextStage)
      }
      const getSummary = () => {
        if (!task) {
          return {
            title: '<Unknown Story>',
            subtitle: ''
          }
        }
        const {integration, title} = task
        if (!integration) {
          // pure parabol task
          return {
            title,
            subtitle: ''
          }
        }
        switch (integration.__typename) {
          case 'JiraIssue':
          case 'JiraServerIssue':
            return {
              title: integration.title,
              subtitle: integration.issueKey
            }
          case 'AzureDevOpsWorkItem':
            return {
              title: integration.title,
              subtitle: `#${integration.id}`
            }
          case '_xGitHubIssue':
            return {
              title: integration.title,
              subtitle: `#${integration.number}`
            }
          case '_xGitLabIssue':
            return {
              title: integration.title,
              subtitle: `#${integration.iid}`
            }
          case '_xLinearIssue':
            return {
              title: integration.title,
              subtitle: `${integration.identifier}`
            }
          default:
            return {
              title: '<Unknown Story>',
              subtitle: ''
            }
        }
      }
      summaries.push({
        ...getSummary(),
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
