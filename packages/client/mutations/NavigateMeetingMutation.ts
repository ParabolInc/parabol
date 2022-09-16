import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {NavigateMeetingMutation_meeting} from '~/__generated__/NavigateMeetingMutation_meeting.graphql'
import {NavigateMeetingMutation_team} from '~/__generated__/NavigateMeetingMutation_team.graphql'
import {ReflectionGroup_reflectionGroup} from '~/__generated__/ReflectionGroup_reflectionGroup.graphql'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import {REFLECT, VOTE} from '../utils/constants'
import isInterruptingChickenPhase from '../utils/isInterruptingChickenPhase'
import getBaseRecord from '../utils/relay/getBaseRecord'
import getInProxy from '../utils/relay/getInProxy'
import safeProxy from '../utils/relay/safeProxy'
import {setLocalStageAndPhase} from '../utils/relay/updateLocalStage'
import {isViewerTypingInComment, isViewerTypingInTask} from '../utils/viewerTypingUtils'
import {
  NavigateMeetingMutation as TNavigateMeetingMutation,
  NavigateMeetingMutationVariables
} from '../__generated__/NavigateMeetingMutation.graphql'
import handleRemoveReflectionGroups from './handlers/handleRemoveReflectionGroups'

graphql`
  fragment NavigateMeetingMutation_meeting on NewMeeting {
    id
    facilitatorStageId
    phases {
      phaseType
    }
    localStage {
      id
    }
  }
`
graphql`
  fragment NavigateMeetingMutation_team on NavigateMeetingPayload {
    meeting {
      ...SelectMeetingDropdownItem_meeting
      ...NavigateMeetingMutation_meeting @relay(mask: false)
    }
    oldFacilitatorStage {
      id
      isComplete
    }
    phaseComplete {
      reflect {
        emptyReflectionGroupIds
        reflectionGroups {
          sortOrder
        }
      }
      group {
        emptyReflectionGroupIds
        meeting {
          phases {
            id
            stages {
              id
              isComplete
              isNavigable
              isNavigableByFacilitator
            }
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
                discussionId
                reflectionGroup {
                  id
                  voteCount
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

export const navigateMeetingTeamUpdater: SharedUpdater<NavigateMeetingMutation_team> = (
  payload,
  {store}
) => {
  const meetingId = safeProxy(payload).getLinkedRecord('meeting').getValue('id')!
  const meeting = store.get<NavigateMeetingMutation_meeting>(meetingId)
  if (!meeting) return

  const viewerStageId = safeProxy(meeting).getLinkedRecord('localStage').getValue('id')
  const facilitatorStageId = safeProxy(meeting).getValue('facilitatorStageId')
  const oldMeeting = getBaseRecord(store, meetingId)
  if (!oldMeeting) {
    console.error(`No base meeting object found in Relay ${meetingId}`)
    return
  }
  if (viewerStageId === oldMeeting.facilitatorStageId) {
    const viewerPhaseType = getInProxy(meeting, 'localPhase', 'phaseType')
    const isViewerTyping = isViewerTypingInTask() || isViewerTypingInComment()
    if (!isInterruptingChickenPhase(viewerPhaseType) || !isViewerTyping) {
      setLocalStageAndPhase(store, meetingId, facilitatorStageId)
    }
  }

  const emptyReflectionGroupIds = safeProxy(payload)
    .getLinkedRecord('phaseComplete')
    .getLinkedRecord('reflect')
    .getValue('emptyReflectionGroupIds')!
  handleRemoveReflectionGroups(emptyReflectionGroupIds, meetingId, store)

  const emptyGroupReflectionGroupIds = safeProxy(payload)
    .getLinkedRecord('phaseComplete')
    .getLinkedRecord('group')
    .getValue('emptyReflectionGroupIds')!
  handleRemoveReflectionGroups(emptyGroupReflectionGroupIds, meetingId, store)

  if (emptyReflectionGroupIds) {
    const phases = meeting.getLinkedRecords('phases')
    if (!phases) return
    const reflectPhase = phases.find(
      (phase) => phase && phase.getValue('__typename') === 'ReflectPhase'
    )
    if (!reflectPhase) return
    const prompts =
      reflectPhase.getLinkedRecords<ReflectionGroup_reflectionGroup[]>('reflectPrompts')
    if (!prompts) return
    prompts.forEach((reflectPrompt) => {
      reflectPrompt?.setValue([], 'editorIds')
    })
  }
  const reflectionGroups =
    meeting.getLinkedRecords<ReflectionGroup_reflectionGroup[]>('reflectionGroups')
  if (!reflectionGroups) return
  const sortedReflectionGroups = reflectionGroups
    .slice()
    .sort((a, b) => (a.getValue('sortOrder') < b.getValue('sortOrder') ? -1 : 1))
  meeting.setLinkedRecords(sortedReflectionGroups, 'reflectionGroups')
}

const NavigateMeetingMutation = (
  atmosphere: Atmosphere,
  variables: NavigateMeetingMutationVariables,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation<TNavigateMeetingMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('navigateMeeting')
      navigateMeetingTeamUpdater(payload, {atmosphere, store})
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
          if (phaseType === VOTE || phaseType === REFLECT) {
            // optimistically creating an array of temporary stages is difficult because they can become undefined
            // same goes for sorting all the reflections based on entities
            // easier to just wait for the return value before advancing
            meeting.setValue(completedStageId, 'facilitatorStageId')
            if (completedStageId) {
              setLocalStageAndPhase(store, meetingId, completedStageId)
            }
          }
        }
      }
    },
    onCompleted,
    onError
  })
}

export default NavigateMeetingMutation
