import {
  NavigateMeetingMutation as TNavigateMeetingMutation,
  NavigateMeetingMutationVariables
} from '__generated__/NavigateMeetingMutation.graphql'
import {NavigateMeetingMutation_team} from '__generated__/NavigateMeetingMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups'
import {VOTE} from 'universal/utils/constants'
import isInterruptingChickenPhase from 'universal/utils/isInterruptingChickenPhase'
import isViewerTyping from 'universal/utils/isViewerTyping'
import clientTempId from 'universal/utils/relay/clientTempId'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getBaseRecord from 'universal/utils/relay/getBaseRecord'
import getInProxy from 'universal/utils/relay/getInProxy'
import {setLocalStageAndPhase} from 'universal/utils/relay/updateLocalStage'
import {DeepNullable, DeepPartial} from '../../types/generics'
import Atmosphere from '../Atmosphere'
import {ClientRetroPhaseItem, ClientRetrospectiveMeeting} from '../types/clientSchema'
import {
  IReflectPhase,
  IRetroDiscussStage,
  IRetrospectiveMeeting,
  NewMeetingPhaseTypeEnum
} from '../types/graphql'
import safeProxy from '../utils/relay/safeProxy'

graphql`
  fragment NavigateMeetingMutation_team on NavigateMeetingPayload {
    meeting {
      id
      facilitatorStageId
    }
    oldFacilitatorStage {
      id
      isComplete
    }
    phaseComplete {
      reflect {
        emptyReflectionGroupIds
      }
      group {
        meeting {
          reflectionGroups {
            ...CompleteReflectionGroupFrag @relay(mask: false)
          }
        }
      }
      vote {
        meeting {
          phases {
            id
            ... on DiscussPhase {
              phaseType
              stages {
                id
                isComplete
                isNavigable
                isNavigableByFacilitator
                meetingId
                phaseType
                reflectionGroup {
                  id
                  tasks {
                    id
                  }
                }
                sortOrder
              }
            }
          }
        }
      }
    }
    unlockedStages {
      id
      isNavigable
      isNavigableByFacilitator
    }
  }
`

const mutation = graphql`
  mutation NavigateMeetingMutation(
    $meetingId: ID!
    $completedStageId: ID
    $facilitatorStageId: ID
  ) {
    navigateMeeting(
      meetingId: $meetingId
      completedStageId: $completedStageId
      facilitatorStageId: $facilitatorStageId
    ) {
      error {
        message
      }
      ...NavigateMeetingMutation_team @relay(mask: false)
    }
  }
`

const optimisticallyCreateRetroTopics = (
  store: RecordSourceSelectorProxy,
  discussPhase: RecordProxy | null,
  meetingId: string
) => {
  if (!discussPhase || discussPhase.getLinkedRecords('stages')!.length > 1) {
    return
  }
  const meeting = store.get<DeepNullable<IRetrospectiveMeeting>>(meetingId)
  if (!meeting) return
  const reflectionGroups = meeting.getLinkedRecords('reflectionGroups')
  if (!reflectionGroups) return
  const topReflectionGroups = reflectionGroups.filter((group) => group.getValue('voteCount')! > 0)
  topReflectionGroups.sort((a, b) => (a.getValue('voteCount')! < b.getValue('voteCount')! ? 1 : -1))
  const discussStages = topReflectionGroups.map((reflectionGroup) => {
    const reflectionGroupId = reflectionGroup.getValue('id')
    const proxyStage = createProxyRecord<DeepPartial<IRetroDiscussStage>>(
      store,
      'RetroDiscussStage',
      {
        id: clientTempId(),
        meetingId,
        isComplete: false,
        phaseType: NewMeetingPhaseTypeEnum.discuss,
        reflectionGroupId
      }
    )
    proxyStage.setLinkedRecord(reflectionGroup as any, 'reflectionGroup')
    return proxyStage
  })
  discussPhase.setLinkedRecords(discussStages, 'stages')
}

export const navigateMeetingTeamUpdater = (
  payload: RecordProxy<NavigateMeetingMutation_team>,
  store: RecordSourceSelectorProxy
) => {
  const meetingId = safeProxy(payload)
    .getLinkedRecord('meeting')
    .getValue('id')!
  const meeting = store.get<ClientRetrospectiveMeeting>(meetingId)
  if (!meeting) return

  const viewerStageId = safeProxy(meeting)
    .getLinkedRecord('localStage')
    .getValue('id')
  const facilitatorStageId = safeProxy(meeting).getValue('facilitatorStageId')
  const oldMeeting = getBaseRecord(store, meetingId)
  if (viewerStageId === oldMeeting.facilitatorStageId) {
    const viewerPhaseType = getInProxy(meeting, 'localPhase', 'phaseType')
    if (!isInterruptingChickenPhase(viewerPhaseType) || !isViewerTyping()) {
      setLocalStageAndPhase(store, meetingId, facilitatorStageId)
    }
  }

  const emptyReflectionGroupIds = safeProxy(payload)
    .getLinkedRecord('phaseComplete')
    .getLinkedRecord('reflect')
    .getValue('emptyReflectionGroupIds')
  handleRemoveReflectionGroups(emptyReflectionGroupIds, meetingId, store)

  if (emptyReflectionGroupIds) {
    const phases = meeting.getLinkedRecords('phases')
    if (!phases) return
    const reflectPhase = phases.find(
      (phase) => phase && phase.getValue('__typename') === 'ReflectPhase'
    ) as RecordProxy<IReflectPhase>
    if (!reflectPhase) return
    const prompts = reflectPhase.getLinkedRecords('reflectPrompts')
    if (!prompts) return
    prompts.forEach((phaseItem) => {
      ((phaseItem as any) as RecordProxy<ClientRetroPhaseItem>).setValue([], 'editorIds')
    })
  }
}

const NavigateMeetingMutation = (
  atmosphere: Atmosphere,
  variables: NavigateMeetingMutationVariables,
  onError?,
  onCompleted?
) => {
  return commitMutation<TNavigateMeetingMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('navigateMeeting')
      navigateMeetingTeamUpdater(payload as any, store as any)
    },
    optimisticUpdater: (store) => {
      const {meetingId, facilitatorStageId, completedStageId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(facilitatorStageId, 'facilitatorStageId')
      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      for (let ii = 0; ii < phases.length; ii++) {
        const phase = phases[ii]
        if (!phase) continue
        const stages = phase.getLinkedRecords('stages')
        if (!stages) continue
        const stage = stages.find(
          (curStage) => !!curStage && curStage.getValue('id') === completedStageId
        )
        if (stage) {
          stage.setValue(true, 'isComplete')
          const phaseType = stage.getValue('phaseType')
          if (phaseType === VOTE) {
            const discussPhase = phases[ii + 1]
            optimisticallyCreateRetroTopics(store as any, discussPhase, meetingId)
          }
        }
      }
    },
    onCompleted,
    onError
  })
}

export default NavigateMeetingMutation
