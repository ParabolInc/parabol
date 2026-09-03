import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {Link, useNavigate} from 'react-router'
import type {TeamPromptOptionsMenu_meeting$key} from '~/__generated__/TeamPromptOptionsMenu_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import {Flag, Link as MuiLink, OpenInNew, Replay} from '~/ui/icons'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import makeAppURL from '../../utils/makeAppURL'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import SlackSVG from '../SlackSVG'

const OptionMenuItem = ({children}: {children: ReactNode}) => (
  <div className='flex w-60 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap px-4 py-1 text-sm leading-6'>
    {children}
  </div>
)

interface Props {
  meetingRef: TeamPromptOptionsMenu_meeting$key
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
  popTooltip: () => void
}

const TeamPromptOptionsMenu = (props: Props) => {
  const {meetingRef, openRecurrenceSettingsModal, openEndRecurringMeetingModal, popTooltip} = props

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
  const navigate = useNavigate()

  const isEnded = !!endedAt
  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt
  const hasActiveMeetings = !!meetingSeries?.activeMeetings?.length
  const canStartRecurrence = !isEnded
  // for now user can end the recurrence only if the meeting is active, or if there are no active meetings in the series
  // it is somewhat arbitrary and might change in the future
  const canEndRecurrence = !isEnded || !hasActiveMeetings
  const canToggleRecurrence = hasRecurrenceEnabled ? canEndRecurrence : canStartRecurrence

  return (
    <MenuContent align='end'>
      {hasRecurrenceEnabled && (
        <MenuItem
          className='p-0'
          onClick={async () => {
            popTooltip()
            const copyUrl = makeAppURL(window.location.origin, `meeting-series/${meetingId}`)
            await navigator.clipboard.writeText(copyUrl)

            SendClientSideEvent(atmosphere, 'Copied Meeting Series Link', {
              teamId: team?.id,
              meetingId: meetingId
            })
          }}
        >
          <OptionMenuItem>
            <MuiLink className='mr-2 text-fg-secondary' />
            Copy meeting permalink
          </OptionMenuItem>
        </MenuItem>
      )}
      <MenuItem
        className='p-0'
        isDisabled={!canToggleRecurrence}
        onSelect={canToggleRecurrence ? undefined : (e) => e.preventDefault()}
        onClick={canToggleRecurrence ? openRecurrenceSettingsModal : undefined}
      >
        <OptionMenuItem>
          <Replay className='mr-2 text-fg-secondary' />
          {hasRecurrenceEnabled ? (
            <span>{'Edit recurrence settings'}</span>
          ) : (
            <span>{'Start recurrence'}</span>
          )}
        </OptionMenuItem>
      </MenuItem>
      <MenuItem
        className='p-0'
        asChild
        onClick={() => {
          SendClientSideEvent(atmosphere, 'Configure Slack Standup Clicked', {
            teamId: team?.id,
            meetingId: meetingId
          })
        }}
      >
        <Link to={`/team/${team.id}/integrations`} target='_blank' rel='noopener noreferrer'>
          <OptionMenuItem>
            <SlackSVG />
            <span className='ml-2'>Configure Slack</span>
            <OpenInNew className='ml-auto text-base text-fg-secondary' />
          </OptionMenuItem>
        </Link>
      </MenuItem>
      <MenuItem
        className='p-0'
        isDisabled={isEnded}
        onSelect={isEnded ? (e) => e.preventDefault() : undefined}
        onClick={
          isEnded
            ? undefined
            : () => {
                if (!hasRecurrenceEnabled) {
                  EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError, navigate})
                } else {
                  openEndRecurringMeetingModal()
                }
              }
        }
      >
        <OptionMenuItem>
          <Flag className='mr-2 text-fg-secondary' />
          <span>{'End this meeting'}</span>
        </OptionMenuItem>
      </MenuItem>
    </MenuContent>
  )
}

export default TeamPromptOptionsMenu
