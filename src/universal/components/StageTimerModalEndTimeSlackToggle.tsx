import React from 'react'
import styled from 'react-emotion'
import 'universal/styles/daypicker.css'
import {createFragmentContainer, graphql} from 'react-relay'
import {SlackNotificationEventEnum} from 'universal/types/graphql'
import SlackClientManager from 'universal/utils/SlackClientManager'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import Checkbox from 'universal/components/Checkbox'
import NotificationErrorMessage from 'universal/modules/notifications/components/NotificationErrorMessage'
import SetSlackNotificationMutation from 'universal/mutations/SetSlackNotificationMutation'
import {StageTimerModalEndTimeSlackToggle_facilitator} from '__generated__/StageTimerModalEndTimeSlackToggle_facilitator.graphql'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import PlainButton from 'universal/components/PlainButton/PlainButton'

interface Props {
  facilitator: StageTimerModalEndTimeSlackToggle_facilitator
  teamId: string
}

const ButtonRow = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: 8,
  width: '100%'
})

const Label = styled('div')({
  cursor: 'pointer',
  fontSize: 14,
  minWidth: 160,
  padding: '8px 0 8px 8px',
  userSelect: 'none'
})

const StyledCheckbox = styled(Checkbox)({
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: ICON_SIZE.MD24
})

const Block = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const StageTimerModalEndTimeSlackToggle = (props: Props) => {
  const {facilitator, teamId} = props
  const {slackAuth, slackNotifications} = facilitator
  const timeLimitEvent = slackNotifications.find(
    (notification) =>
      notification.event === SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT_START
  )
  const slackToggleActive = (timeLimitEvent && !!timeLimitEvent.channelId) || false
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {onError, onCompleted, submitMutation, error, submitting} = mutationProps

  const onClick = () => {
    if (slackAuth && slackAuth.isActive) {
      if (submitting) return
      const {defaultTeamChannelId} = slackAuth
      submitMutation()
      const variables = {
        slackChannelId: slackToggleActive ? null : defaultTeamChannelId,
        slackNotificationEvents: [SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT_START],
        teamId
      }
      SetSlackNotificationMutation(atmosphere, variables, {onError, onCompleted})
    } else {
      SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
    }
  }
  return (
    <Block>
      <ButtonRow onClick={onClick}>
        <StyledCheckbox active={slackToggleActive} />
        <Label>{'Notify team via Slack'}</Label>
      </ButtonRow>
      <NotificationErrorMessage error={error} />
    </Block>
  )
}

export default createFragmentContainer(StageTimerModalEndTimeSlackToggle, {
  facilitator: graphql`
    fragment StageTimerModalEndTimeSlackToggle_facilitator on TeamMember {
      slackAuth {
        isActive
        defaultTeamChannelId
      }
      slackNotifications {
        channelId
        event
      }
    }
  `
})
