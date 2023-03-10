import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import StyledError from '../../../../components/StyledError'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import SetSlackNotificationMutation from '../../../../mutations/SetSlackNotificationMutation'
import {MeetingLabels} from '../../../../types/constEnums'
import {
  SlackNotificationEventEnum,
  SlackNotificationRow_viewer$key
} from '../../../../__generated__/SlackNotificationRow_viewer.graphql'

interface Props {
  event: SlackNotificationEventEnum
  localChannelId: string | null
  viewer: SlackNotificationRow_viewer$key
  teamId: string
}

const labelLookup = {
  meetingEnd: 'Meeting End',
  meetingStart: 'Meeting Start',
  MEETING_STAGE_TIME_LIMIT_END: `Meeting ${MeetingLabels.TIME_LIMIT} Ended`,
  MEETING_STAGE_TIME_LIMIT_START: `Meeting ${MeetingLabels.TIME_LIMIT} Started`
} as Record<SlackNotificationEventEnum, string>

const Row = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '8px 0'
})

const Label = styled('span')({
  fontSize: 14,
  marginRight: 16,
  width: '100%'
})

const SlackNotificationRow = (props: Props) => {
  const {event, localChannelId, teamId, viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment SlackNotificationRow_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            slack {
              notifications {
                channelId
                event
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {slack} = integrations
  const notifications = slack?.notifications ?? []
  const label = labelLookup[event]
  const atmosphere = useAtmosphere()
  const existingNotification = notifications.find((notification) => notification.event === event)
  const active = !!(existingNotification && existingNotification.channelId)
  const {error, submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const slackChannelId = active ? null : localChannelId
    SetSlackNotificationMutation(
      atmosphere,
      {slackChannelId, slackNotificationEvents: [event as any], teamId},
      {
        onError,
        onCompleted
      }
    )
  }

  // does not show disabled when submitting because the temporary disabled mouse icon is ugly
  return (
    <>
      <Row>
        <Label>{label}</Label>
        <Toggle active={active} disabled={!localChannelId} onClick={onClick} />
      </Row>
      {error && <StyledError>{error.message}</StyledError>}
    </>
  )
}

export default SlackNotificationRow
