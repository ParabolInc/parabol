import graphql from 'babel-plugin-relay/macro'
import {stateToHTML} from 'draft-js-export-html'
import {commitMutation} from 'react-relay'
import GitLabIssueId from '~/shared/gqlIds/GitLabIssueId'
//import AzureDevOpsIssueId from '~/shared/gqlIds/AzureDevOpsIssueId'
import GitHubIssueId from '../shared/gqlIds/GitHubIssueId'
import JiraIssueId from '../shared/gqlIds/JiraIssueId'
import {PALETTE} from '../styles/paletteV3'
import {BaseLocalHandlers, StandardMutation} from '../types/relayMutations'
import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
import splitDraftContent from '../utils/draftjs/splitDraftContent'
import getSearchQueryFromMeeting from '../utils/getSearchQueryFromMeeting'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {UpdatePokerScopeMutation as TUpdatePokerScopeMutation} from '../__generated__/UpdatePokerScopeMutation.graphql'
import SendClientSegmentEventMutation from './SendClientSegmentEventMutation'

graphql`
  fragment UpdatePokerScopeMutation_meeting on UpdatePokerScopeSuccess {
    newStages {
      ...useMakeStageSummaries_stages
      ...PokerEstimateHeaderCard_stage
      ...PokerCardDeckStage
      ...EstimatePhaseAreaStage
      ...JiraFieldDimensionDropdown_stage
      ...EstimateDimensionColumn_stage
      ...EstimatePhaseDiscussionDrawerEstimateStage
      id
      isNavigableByFacilitator
      isVoting
      taskId
      dimensionRef {
        name
        scale {
          values {
            color
            label
          }
        }
      }
      serviceField {
        name
        type
      }
      scores {
        userId
        label
        stageId
        user {
          picture
          preferredName
        }
      }
    }
    meeting {
      ...PokerMeeting_meeting
      ...useInitialSafeRoute_meeting
      ...useUpdatedSafeRoute_meeting
      gitlabSearchQuery {
        queryString
        selectedProjectsIds
      }
      githubSearchQuery {
        queryString
      }
      jiraSearchQuery {
        queryString
        projectKeyFilters
      }
      parabolSearchQuery {
        queryString
      }
      phases {
        ... on EstimatePhase {
          stages {
            # separate out newStages from all stages so we don't have to fetch
            # all the stage integrations on every update
            # still fetch IDs so we can handle removes
            id
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdatePokerScopeMutation($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdatePokerScopeMutation_meeting @relay(mask: false)
    }
  }
`

export type PokerScopeMeeting = NonNullable<
  TUpdatePokerScopeMutation['response']['updatePokerScope']['meeting']
>

interface Handlers extends BaseLocalHandlers {
  contents: string[]
  selectedAll?: boolean
}

const UpdatePokerScopeMutation: StandardMutation<TUpdatePokerScopeMutation, Handlers> = (
  atmosphere,
  variables,
  {onError, onCompleted, contents, selectedAll}
) => {
  return commitMutation<TUpdatePokerScopeMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!viewer) return
      const viewerId = viewer?.getValue('id')
      const {meetingId, updates} = variables
      const meeting = store.get<PokerScopeMeeting>(meetingId)
      if (!meeting) return
      const teamId = (meeting.getValue('teamId') || '') as string
      const team = store.get(teamId)
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')
      if (!estimatePhase) return
      const stages = estimatePhase.getLinkedRecords('stages')
      const [firstStage] = stages
      const dimensionRefIds = [] as string[]
      if (firstStage) {
        const firstStageTaskId = firstStage.getValue('taskId')
        const stagesForTaskId = stages.filter(
          (stage) => stage.getValue('taskId') === firstStageTaskId
        )
        stagesForTaskId.forEach((stage) => {
          const dimensionRef = stage.getLinkedRecord('dimensionRef')
          const dimensionRefId = dimensionRef?.getValue('id') as string | null
          dimensionRefId && dimensionRefIds.push(dimensionRefId)
        })
      }
      if (dimensionRefIds.length === 0) {
        const value = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.SLATE_600,
          label: '#'
        })
        const scale = createProxyRecord(store, 'TemplateScaleRef', {})
        scale.setLinkedRecords([value], 'values')
        const dimensionRefId = clientTempId()
        const dimensionRef = createProxyRecord(store, 'TemplateDimensionRef', {
          id: dimensionRefId,
          name: 'Loading'
        })
        dimensionRef.setLinkedRecord(scale, 'scale')
        dimensionRefIds.push(dimensionRefId)
      }
      updates.forEach((update, idx) => {
        const {serviceTaskId, action, service} = update
        if (action === 'ADD') {
          const stageTasks = stages.map((stage) =>
            stage.getLinkedRecord<{integrationHash: string}>('task')
          )
          const stageIntegrationHashes = stageTasks.map(
            (task) => task?.getValue('integrationHash') ?? ''
          )
          const stageExists = stageIntegrationHashes.includes(serviceTaskId)
          if (stageExists) return

          // create a task if it doesn't exist
          const plaintextContent = contents[idx] ?? ''
          const content = convertToTaskContent(plaintextContent)
          const {title, contentState} = splitDraftContent(content)
          const optimisticTask = createProxyRecord(store, 'Task', {
            createdBy: viewerId,
            plaintextContent,
            content,
            sortOrder: 0,
            status: 'future',
            tags: ['#archived'],
            teamId,
            title,
            integrationHash: service === 'PARABOL' ? '' : serviceTaskId
          })
          optimisticTask
            .setLinkedRecord(viewer, 'createdByUser')
            .setLinkedRecords([], 'estimates')
            .setLinkedRecords([], 'editors')
            .setLinkedRecord(team!, 'team')
          if (service === 'jira') {
            const descriptionHTML = stateToHTML(contentState)
            const {cloudId, issueKey, projectKey} = JiraIssueId.split(serviceTaskId)
            const optimisticTaskIntegration = createProxyRecord(store, 'JiraIssue', {
              teamId,
              meetingId,
              userId: viewerId,
              cloudId,
              cloudName: '',
              url: '',
              issueKey,
              projectKey,
              summary: plaintextContent,
              description: '',
              descriptionHTML
            })
            optimisticTask.setLinkedRecord(optimisticTaskIntegration, 'integration')
          } else if (service === 'azureDevOps') {
            //const descriptionHTML = stateToHTML(contentState)
            //const {instanceId, issueKey, projectKey} = AzureDevOpsIssueId.split(serviceTaskId)
            const optimisticTaskIntegration = createProxyRecord(store, 'AzureDevOpsWorkItem', {
              teamId,
              meetingId,
              userId: viewerId,
              url: '',
              title,
              state: '',
              type: ''
            })
            optimisticTask.setLinkedRecord(optimisticTaskIntegration, 'integration')
          } else if (service === 'github') {
            const bodyHTML = stateToHTML(contentState)
            const {issueNumber, nameWithOwner, repoName, repoOwner} =
              GitHubIssueId.split(serviceTaskId)
            const repository = createProxyRecord(store, '_xGitHubRepository', {
              nameWithOwner,
              name: repoName,
              owner: repoOwner
            })
            const optimisticTaskIntegration = createProxyRecord(store, '_xGitHubIssue', {
              number: issueNumber,
              title,
              description: '',
              url: '',
              bodyHTML
            })
            optimisticTaskIntegration.setLinkedRecord(repository, 'repository')
            optimisticTask.setLinkedRecord(optimisticTaskIntegration, 'integration')
          } else if (service === 'gitlab') {
            const {gid} = GitLabIssueId.split(serviceTaskId)
            const gitlabIssue = store.get(gid)
            const iid = gitlabIssue?.getValue('iid')
            const optimisticGitLabIssue = createProxyRecord(store, '_xGitLabIssue', {
              title,
              iid
            })
            optimisticTask.setLinkedRecord(optimisticGitLabIssue, 'integration')
          }

          const newStages = dimensionRefIds.map((dimensionRefId, dimensionRefIdx) => {
            const nextStage = createProxyRecord(store, 'EstimateStage', {
              durations: undefined,
              dimensionRefIdx,
              teamId,
              meetingId,
              taskId: optimisticTask.getValue('id')
            })
            nextStage
              .setLinkedRecord(
                createProxyRecord(store, 'ServiceField', {
                  name: 'Unknown',
                  type: 'number'
                }),
                'serviceField'
              )
              .setLinkedRecord(optimisticTask, 'task')
              .setLinkedRecords([], 'scores')
              .setLinkedRecords([], 'hoveringUsers')
              .setLinkedRecord(store.get(dimensionRefId)!, 'dimensionRef')
            return nextStage
          })

          const nextStages = [...estimatePhase.getLinkedRecords('stages'), ...newStages]
          estimatePhase.setLinkedRecords(nextStages, 'stages')
        } else if (action === 'DELETE') {
          const nextStages = stages.filter((stage) => {
            const task = stage.getLinkedRecord('task')
            const integrationHash = task?.getValue('integrationHash')
            return integrationHash !== serviceTaskId
          })
          estimatePhase.setLinkedRecords(nextStages, 'stages')
        }
      })
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const {updatePokerScope} = res
      const {meeting} = updatePokerScope
      if (!meeting) return
      const {meetingId, updates} = variables
      const update = updates[0]!
      const {service, action} = update
      const searchQuery = getSearchQueryFromMeeting(meeting, service)
      if (!searchQuery) return
      const {searchQueryString, searchQueryFilters} = searchQuery
      SendClientSegmentEventMutation(atmosphere, 'Updated Poker Scope', {
        meetingId,
        service,
        action,
        searchQueryString,
        searchQueryFilters,
        selectedAll
      })
    },
    onError,
    cacheConfig: {
      metadata: {
        casualOrderingGroup: 'updatePokerScope'
      }
    }
  })
}

export default UpdatePokerScopeMutation
