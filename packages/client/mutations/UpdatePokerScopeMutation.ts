import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {PALETTE} from '../styles/paletteV2'
import {IEstimatePhase, IPokerMeeting, ITemplateDimension, NewMeetingPhaseTypeEnum} from '../types/graphql'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {UpdatePokerScopeMutation as TUpdatePokerScopeMutation} from '../__generated__/UpdatePokerScopeMutation.graphql'

graphql`
  fragment UpdatePokerScopeMutation_meeting on UpdatePokerScopeSuccess {
    meeting {
      phases {
        ...useMakeStageSummaries_phase
        ...on EstimatePhase {
          stages {
            ...PokerCardDeckStage
            ...EstimatePhaseAreaStage
            ...JiraFieldDimensionDropdown_stage
            ...EstimateDimensionColumn_stage
            id
            isNavigableByFacilitator
            service
            serviceTaskId
            sortOrder
            isVoting
            creatorUserId
            dimension {
              name
              selectedScale {
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

const UpdatePokerScopeMutation: StandardMutation<TUpdatePokerScopeMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdatePokerScopeMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {meetingId, updates} = variables
      const meeting = store.get<IPokerMeeting>(meetingId)
      if (!meeting) return
      const teamId = meeting.getValue('teamId') || ''
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === NewMeetingPhaseTypeEnum.ESTIMATE) as RecordProxy<IEstimatePhase>
      const stages = estimatePhase.getLinkedRecords('stages')
      const [firstStage] = stages
      let dimension = firstStage?.getLinkedRecord<ITemplateDimension>('dimension')
      if (!dimension) {
        const value = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.BACKGROUND_GRAY,
          label: '#'
        })
        const selectedScale = createProxyRecord(store, 'TemplateScale', {

        })
        selectedScale.setLinkedRecords([value], 'values')
        dimension = createProxyRecord(store, 'TeplateDimension', {
          name: 'Loading'
        }) as any
        dimension.setLinkedRecord(selectedScale, 'selectedScale')
      }
      updates.forEach((update) => {
        const {service, serviceTaskId, action} = update

        if (action === 'ADD') {
          const stageExists = !!stages.find((stage) => stage.getValue('serviceTaskId') === serviceTaskId)
          if (stageExists) return
          const lastSortOrder = stages[stages.length - 1]?.getValue('sortOrder') ?? -1

          const serviceField = createProxyRecord(store, 'ServiceField', {
            name: 'Unknown',
            type: 'number'
          })

          const nextEstimateStage = createProxyRecord(store, 'EstimateStage', {
            creatorUserId: viewerId,
            service,
            serviceTaskId,
            sortOrder: lastSortOrder + 1,
            durations: undefined,
            dimensionId: '',
            teamId,
            meetingId
          })
          nextEstimateStage.setLinkedRecords([], 'scores')
          nextEstimateStage.setLinkedRecords([], 'hoveringUsers')
          nextEstimateStage.setLinkedRecord(serviceField, 'serviceField')
          nextEstimateStage.setLinkedRecord(dimension, 'dimension')
          const story = store.get(serviceTaskId)
          if (story) {
            nextEstimateStage.setLinkedRecord(story, 'story')
          }
          const nextStages = [
            ...estimatePhase.getLinkedRecords('stages'),
            nextEstimateStage
          ]
          estimatePhase.setLinkedRecords(nextStages, 'stages')
        } else if (action === 'DELETE') {
          // const stagesToRemove = stages.filter((stage) => stage.getValue('serviceTaskId') === serviceTaskId)
          // if (stagesToRemove.length > 0) {
          const nextStages = stages.filter((stage) => stage.getValue('serviceTaskId') !== serviceTaskId)
          estimatePhase.setLinkedRecords(nextStages, 'stages')
        }
      })
    },
    onCompleted,
    onError
  })
}

export default UpdatePokerScopeMutation
