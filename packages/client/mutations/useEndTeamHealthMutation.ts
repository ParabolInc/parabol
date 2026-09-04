import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, type UseMutationConfig, useMutation} from 'react-relay'
import {useNavigate} from 'react-router'
import type {RecordProxy} from 'relay-runtime'
import type {useEndTeamHealthMutation_team$data} from '~/__generated__/useEndTeamHealthMutation_team.graphql'
import onMeetingRoute from '~/utils/onMeetingRoute'
import type {useEndTeamHealthMutation as TEndTeamHealthMutation} from '../__generated__/useEndTeamHealthMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {OnNextHandler, OnNextNavigateContext, SharedUpdater} from '../types/relayMutations'
import {setLocalStageAndPhase} from '../utils/relay/updateLocalStage'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'

graphql`
  fragment useEndTeamHealthMutation_team on EndTeamHealthSuccess {
    meeting {
      id
      endedAt
      summaryPageId
    }
    team {
      id
      activeMeetings {
        id
      }
    }
    timelineEvent {
      ...TimelineEventTeamHealthComplete_timelineEvent @relay(mask: false)
    }
  }
`

graphql`
  fragment useEndTeamHealthMutation_meeting on EndTeamHealthSuccess {
    meeting {
      id
      endedAt
      # ending the meeting is the reveal: it unlocks every aggregate and reorders the result
      # stages by urgency, so anyone sitting in the meeting needs the new phases pushed to them
      phases {
        id
        phaseType
        stages {
          id
          ... on TeamHealthResultStage {
            score
            previousScore
            responses {
              id
              score
              commentParaphrased
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation useEndTeamHealthMutation($meetingId: ID!) {
    endTeamHealth(meetingId: $meetingId) {
      ...useEndTeamHealthMutation_team @relay(mask: false)
      ...useEndTeamHealthMutation_meeting @relay(mask: false)
    }
  }
`

export const endTeamHealthTeamOnNext: OnNextHandler<
  useEndTeamHealthMutation_team$data,
  OnNextNavigateContext
> = (payload, context) => {
  const {meeting} = payload
  const {atmosphere} = context
  if (!meeting) return
  const {id: meetingId} = meeting
  if (!onMeetingRoute(window.location.pathname, [meetingId])) return
  // the reveal keeps everyone in the meeting, landing on the stage the sort deemed most urgent
  commitLocalUpdate(atmosphere, (store) => {
    const meetingProxy = store.get(meetingId)
    const resultPhase = meetingProxy
      ?.getLinkedRecords('phases')
      ?.find((phase) => phase?.getValue('phaseType') === 'TEAM_HEALTH_RESULT')
    const firstStageId = resultPhase?.getLinkedRecords('stages')?.[0]?.getValue('id')
    if (typeof firstStageId !== 'string') return
    setLocalStageAndPhase(store, meetingId, firstStageId)
  })
}

export const endTeamHealthTeamUpdater: SharedUpdater<useEndTeamHealthMutation_team$data> = (
  payload,
  {store}
) => {
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
}

const useEndTeamHealthMutation = () => {
  const [commit, submitting] = useMutation<TEndTeamHealthMutation>(mutation)
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const execute = (config: UseMutationConfig<TEndTeamHealthMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('endTeamHealth')
        if (!payload) return
        endTeamHealthTeamUpdater(payload as any, {atmosphere, store: store as any})
      },
      ...config,
      onCompleted: (res, errors) => {
        config.onCompleted?.(res, errors)
        const payload = res?.endTeamHealth
        if (!payload) return
        endTeamHealthTeamOnNext(payload as any, {atmosphere, navigate})
      }
    })
  }
  return [execute, submitting] as const
}

export default useEndTeamHealthMutation
