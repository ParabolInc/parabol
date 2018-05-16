import {commitLocalUpdate, commitMutation} from 'react-relay'
import {setLocalStageAndPhase} from 'universal/utils/relay/updateLocalStage'
import getInProxy from 'universal/utils/relay/getInProxy'
import {DISCUSS, VOTE} from 'universal/utils/constants'
import clientTempId from 'universal/utils/relay/clientTempId'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups'

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
        reflectionGroups {
          title
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

export const navigateMeetingTeamOnNext = (payload, context) => {
  const {environment} = context
  const {
    meeting: {id: meetingId, facilitatorStageId},
    oldFacilitatorStage: {id: oldFacilitatorStageId}
  } = payload
  commitLocalUpdate(environment, (store) => {
    const meetingProxy = store.get(meetingId)
    const viewerStageId = getInProxy(meetingProxy, 'localStage', 'id')
    if (viewerStageId === oldFacilitatorStageId) {
      setLocalStageAndPhase(store, meetingId, facilitatorStageId)
    }
  })
}

const optimisticallyCreateRetroTopics = (store, discussPhase, meetingId) => {
  if (!discussPhase || discussPhase.getLinkedRecords('stages').length > 1) {
    return
  }
  const meeting = store.get(meetingId)
  const reflectionGroups = meeting.getLinkedRecords('reflectionGroups')
  const topReflectionGroups = reflectionGroups.filter((group) => group.getValue('voteCount') > 0)
  topReflectionGroups.sort((a, b) => (a.getValue('voteCount') < b.getValue('voteCount') ? 1 : -1))
  const discussStages = topReflectionGroups.map((reflectionGroup) => {
    const reflectionGroupId = reflectionGroup.getValue('id')
    const proxyStage = createProxyRecord(store, 'RetroDiscussStage', {
      id: clientTempId(),
      meetingId,
      isComplete: false,
      phaseType: DISCUSS,
      reflectionGroupId
    })
    proxyStage.setLinkedRecord(reflectionGroup, 'reflectionGroup')
    return proxyStage
  })
  discussPhase.setLinkedRecords(discussStages, 'stages')
}

export const navigateMeetingTeamUpdater = (payload, store) => {
  const emptyReflectionGroupIds = getInProxy(
    payload,
    'phaseComplete',
    'reflect',
    'emptyReflectionGroupIds'
  )
  if (!emptyReflectionGroupIds) return
  const meetingId = getInProxy(payload, 'meeting', 'id')
  handleRemoveReflectionGroups(emptyReflectionGroupIds, meetingId, store)
}

const NavigateMeetingMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('navigateMeeting')
      if (!payload) return
      navigateMeetingTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {meetingId, facilitatorStageId, completedStageId} = variables
      const meeting = store.get(meetingId)
      meeting.setValue(facilitatorStageId, 'facilitatorStageId')
      const phases = meeting.getLinkedRecords('phases')
      for (let ii = 0; ii < phases.length; ii++) {
        const phase = phases[ii]
        const stages = phase.getLinkedRecords('stages')
        const stage = stages.find((curStage) => curStage.getValue('id') === completedStageId)
        if (stage) {
          stage.setValue(true, 'isComplete')
          const phaseType = stage.getValue('phaseType')
          if (phaseType === VOTE) {
            const discussPhase = phases[ii + 1]
            optimisticallyCreateRetroTopics(store, discussPhase, meetingId)
          }
        }
      }
    },
    onCompleted,
    onError
  })
}

export default NavigateMeetingMutation
