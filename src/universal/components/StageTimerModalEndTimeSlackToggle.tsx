import React from 'react'
import 'universal/styles/daypicker.css'
import {createFragmentContainer, graphql} from 'react-relay'
import {SlackNotificationEventEnum} from 'universal/types/graphql'
import SlackClientManager from 'universal/utils/SlackClientManager'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import Toggle from 'universal/components/Toggle/Toggle'
import NotificationErrorMessage from 'universal/modules/notifications/components/NotificationErrorMessage'
import SetSlackNotificationMutation from 'universal/mutations/SetSlackNotificationMutation'
import {StageTimerModalEndTimeSlackToggle_facilitator} from '__generated__/StageTimerModalEndTimeSlackToggle_facilitator.graphql'

interface Props {
  facilitator: StageTimerModalEndTimeSlackToggle_facilitator
  teamId: string
}

const StageTimerModalEndTimeSlackToggle = (props: Props) => {
  const {facilitator, teamId} = props
  const {slackAuth, slackNotifications} = facilitator
  const timeLimitEvent = slackNotifications.find(
    (notification) => notification.event === SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT
  )
  const slackToggleActive = (timeLimitEvent && !!timeLimitEvent.channelId) || false
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {onError, onCompleted, submitMutation, error, submitting} = mutationProps

  const onClick = () => {
    if (slackAuth) {
      if (submitting) return
      const {defaultTeamChannelId} = slackAuth
      submitMutation()
      const variables = {
        slackChannelId: slackToggleActive ? null : defaultTeamChannelId,
        slackNotificationEvents: [SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT],
        teamId
      }
      SetSlackNotificationMutation(atmosphere, variables, {onError, onCompleted})
    } else {
      SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
    }
  }
  return (
    <>
      <Toggle active={slackToggleActive} onClick={onClick} />
      <span>{'Notify me via Slack'}</span>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(
  StageTimerModalEndTimeSlackToggle,
  graphql`
    fragment StageTimerModalEndTimeSlackToggle_facilitator on TeamMember {
      slackAuth {
        defaultTeamChannelId
      }
      slackNotifications {
        channelId
        event
      }
    }
  `
)
