import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UpdatePokerScopeMutation as TUpdatePokerScopeMutation} from '../__generated__/UpdatePokerScopeMutation.graphql'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import {splitTipTapContent} from '../shared/tiptap/splitTipTapContent'
import {PALETTE} from '../styles/paletteV3'
import {SprintPokerDefaults} from '../types/constEnums'
import type {BaseLocalHandlers, StandardMutation} from '../types/relayMutations'
import getSearchQueryFromMeeting from '../utils/getSearchQueryFromMeeting'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import SendClientSideEvent from '../utils/SendClientSideEvent'

graphql`
  fragment UpdatePokerScopeMutation_meeting on UpdatePokerScopeSuccess {
    newStages {
      ...useMakeStageSummaries_stages
      ...PokerEstimateHeaderCard_stage
      ...PokerCardDeckStage
      ...EstimatePhaseAreaStage
      ...EstimateFieldDropdown_stage
      ...EstimateDimensionColumn_stage
      ... on EstimateStage {
        discussionId
      }
      id
      isNavigableByFacilitator
      isVoting
      taskId
      serviceTaskId
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
        fieldId
        label
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
      ...useInitialSafeRoute_meeting
      ...useUpdatedSafeRoute_meeting
      # Necessary to show the Next button if someone adds an issue and the facilitator is on the last one
      ...MeetingControlBar_meeting
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
      linearSearchQuery {
        queryString
        selectedProjectsIds
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
          const stageExists = stages.some(
            (stage) => stage.getValue('serviceTaskId') === serviceTaskId
          )
          if (stageExists) return

          const plaintextContent = contents[idx] ?? ''
          const content = JSON.stringify(plaintextToTipTap(plaintextContent))
          const {title} = splitTipTapContent(JSON.parse(content))
          const optimisticTask = createProxyRecord(store, 'Task', {
            createdBy: viewerId,
            plaintextContent,
            content,
            sortOrder: 0,
            status: 'future',
            tags: ['#archived'],
            teamId,
            title,
            integrationHash: service === 'PARABOL' ? null : serviceTaskId
          })
          optimisticTask
            .setLinkedRecord(viewer, 'createdByUser')
            .setLinkedRecords([], 'estimates')
            .setLinkedRecords([], 'editors')
            .setLinkedRecord(team!, 'team')
          if (service !== 'PARABOL') {
            optimisticTask.setLinkedRecord(store.get(serviceTaskId) ?? null, 'integration')
          }

          const newStages = dimensionRefIds.map((dimensionRefId, dimensionRefIdx) => {
            const nextStage = createProxyRecord(store, 'EstimateStage', {
              durations: undefined,
              dimensionRefIdx,
              teamId,
              meetingId,
              taskId: optimisticTask.getValue('id'),
              serviceTaskId
            })
            nextStage
              .setLinkedRecord(
                createProxyRecord(store, 'ServiceField', {
                  fieldId: SprintPokerDefaults.SERVICE_FIELD_NULL,
                  label: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL,
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
          const nextStages = stages.filter(
            (stage) => stage.getValue('serviceTaskId') !== serviceTaskId
          )
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
      SendClientSideEvent(atmosphere, 'Updated Poker Scope', {
        meetingId,
        service,
        action,
        searchQueryString,
        searchQueryFilters,
        selectedAll
      })
    },
    onError
  })
}

export default UpdatePokerScopeMutation
