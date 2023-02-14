import styled from '@emotion/styled'
import {Flag, Link, Replay} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import {TeamPromptOptionsMenu_meeting$key} from '~/__generated__/TeamPromptOptionsMenu_meeting.graphql'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../../styles/paletteV3'
import makeAppURL from '../../utils/makeAppURL'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import {MenuItemLabelStyle} from '../MenuItemLabel'

const LinkIcon = styled(Link)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const ReplayIcon = styled(Replay)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const FlagIcon = styled(Flag)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '240px'
})

interface Props {
  meetingRef: TeamPromptOptionsMenu_meeting$key
  menuProps: MenuProps
  openRecurrenceSettingsModal: () => void
}

const TeamPromptOptionsMenu = (props: Props) => {
  const {meetingRef, menuProps, openRecurrenceSettingsModal} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptionsMenu_meeting on TeamPromptMeeting {
        id
        team {
          id
        }
        meetingSeries {
          id
          recurrenceRule
          cancelledAt
          activeMeetings {
            id
          }
        }
        endedAt
      }
    `,
    meetingRef
  )

  const {id: meetingId, meetingSeries, endedAt, team} = meeting
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {history} = useRouter()

  const isEnded = !!endedAt
  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt
  const hasActiveMeetings = !!meetingSeries?.activeMeetings?.length
  const canStartRecurrence = !isEnded
  // for now user can end the recurrence only if the meeting is active, or if there are no active meetings in the series
  // it is somewhat arbitrary and might change in the future
  const canEndRecurrence = !isEnded || !hasActiveMeetings
  const canToggleRecurrence = hasRecurrenceEnabled ? canEndRecurrence : canStartRecurrence

  return (
    <Menu ariaLabel={'Edit the meeting'} {...menuProps}>
      {hasRecurrenceEnabled && (
        <MenuItem
          key='link'
          label={
            <OptionMenuItem>
              <LinkIcon />
              Copy meeting permalink
            </OptionMenuItem>
          }
          onClick={async () => {
            const copyUrl = makeAppURL(window.location.origin, `meeting-series/${meetingId}`)
            await navigator.clipboard.writeText(copyUrl)

            SendClientSegmentEventMutation(atmosphere, 'Copied Meeting Series Link', {
              teamId: team?.id,
              meetingId: meetingId
            })
          }}
        />
      )}
      <MenuItem
        key='copy'
        isDisabled={!canToggleRecurrence}
        label={
          <OptionMenuItem>
            <ReplayIcon />
            {hasRecurrenceEnabled ? (
              <span>{'Edit recurrence settings'}</span>
            ) : (
              <span>{'Start recurrence'}</span>
            )}
          </OptionMenuItem>
        }
        onClick={() => {
          menuProps.closePortal()
          openRecurrenceSettingsModal()
        }}
      />
      <MenuItem
        key='end'
        isDisabled={isEnded}
        label={
          <OptionMenuItem>
            <FlagIcon />
            <span>{'End this activity'}</span>
          </OptionMenuItem>
        }
        onClick={() => {
          menuProps.closePortal()
          EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError, history})
        }}
      />
    </Menu>
  )
}

export default TeamPromptOptionsMenu
