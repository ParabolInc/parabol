import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import JiraIssueId from '../shared/gqlIds/JiraIssueId'
import {useMakeStageSummaries_phase$key} from '../__generated__/useMakeStageSummaries_phase.graphql'

interface StageSummary {
  title: string
  subtitle: string
  isComplete: boolean
  isNavigable: boolean
  isActive: boolean
  sortOrder: number
  stageIds: string[]
  finalScores: (string | null)[]
}

const useMakeStageSummaries = (phaseRef: any, localStageId: string) => {
  const estimatePhase = readInlineData<useMakeStageSummaries_phase$key>(
    graphql`
      fragment useMakeStageSummaries_phase on EstimatePhase @inline {
        phaseType
        stages {
          id
          finalScore
          isComplete
          isNavigable
          sortOrder
          service
          serviceTaskId
          story {
            ... on Task {
              __typename
              title
              integration {
                ... on JiraIssue {
                  __typename
                  issueKey
                  title
                }
                ... on _xGitHubIssue {
                  __typename
                  title
                  number
                }
              }
            }
            ... on JiraIssue {
              __typename
              title
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
      const {serviceTaskId, story} = stage
      const batch = [stage]
      for (let j = i + 1; j < stages.length; j++) {
        const nextStage = stages[j]
        if (nextStage.serviceTaskId !== serviceTaskId) break
        batch.push(nextStage)
      }
      const getSummary = () => {
        if (!story) {
          // can remove during #5163
          // the service is down
          if (stage.service === 'jira') {
            return {
              title: '<Unknown Story>',
              subtitle: JiraIssueId.split(serviceTaskId).issueKey
            }
          }
          return {
            title: '<Unknown Story>',
            subtitle: ''
          }
        }
        if (story.__typename === 'Task') {
          const {integration, title} = story
          if (!integration) {
            // pure parabol task
            return {
              title,
              subtitle: ''
            }
          }
          if (integration.__typename === 'JiraIssue') {
            // jira-integration parabol card
            return {
              title: integration.title,
              subtitle: integration.issueKey
            }
          } else if (integration.__typename === '_xGitHubIssue') {
            return {
              title: integration.title,
              subtitle: String(integration.number)
            }
          }
          return {
            title: '<Unknown Story>',
            subtitle: ''
          }
        }
        if (story.__typename === 'JiraIssue') {
          return {
            title: story.title,
            subtitle: JiraIssueId.split(serviceTaskId).issueKey
          }
        }
        return {
          title: '<Unknown Story>',
          subtitle: ''
        }
      }
      summaries.push({
        ...getSummary(),
        isComplete: batch.every(({isComplete}) => isComplete),
        isNavigable: batch.some(({isNavigable}) => isNavigable),
        isActive: !!batch.find(({id}) => id === localStageId),
        sortOrder: stage.sortOrder,
        stageIds: batch.map(({id}) => id),
        finalScores: batch.map(({finalScore}) => finalScore)
      })
      serviceTaskSet.add(serviceTaskId)
      i += batch.length - 1
    }
    return summaries
  }, [phaseRef, localStageId])
}

export default useMakeStageSummaries
