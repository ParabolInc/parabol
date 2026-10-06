import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {useTeamPromptOptionItems_meeting$key} from '~/__generated__/useTeamPromptOptionItems_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import {Edit, Flag, Link as MuiLink, Replay} from '~/ui/icons'
import {getProviderAnchorId} from '../../modules/teamDashboard/components/ProviderRow/ProviderRowEntry'
import {Providers} from '../../types/constEnums'
import makeAppURL from '../../utils/makeAppURL'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import SlackSVG from '../SlackSVG'
import countUnsharedDrafts from './structured/countUnsharedDrafts'

export interface TeamPromptOptionItem {
  key: string
  label: string
  icon: ReactNode
  onClick?: () => void
  to?: string
  isNewTab?: boolean
  isDisabled?: boolean
  isDestructive?: boolean
}

interface Options {
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
  onCopied: () => void
}

const useTeamPromptOptionItems = (
  meetingRef: useTeamPromptOptionItems_meeting$key,
  options: Options
) => {
  const {openRecurrenceSettingsModal, openEndRecurringMeetingModal, onCopied} = options
  const meeting = useFragment(
    graphql`
      fragment useTeamPromptOptionItems_meeting on TeamPromptMeeting {
        id
        team {
          id
        }
        template {
          id
          viewerLowestScope
        }
        meetingSeries {
          id
          recurrenceRule
          cancelledAt
          activeMeetings {
            id
          }
        }
        responses {
          userId
          sharedAt
          content
        }
        endedAt
      }
    `,
    meetingRef
  )

  const {id: meetingId, meetingSeries, endedAt, team, template, responses} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {onCompleted, onError} = useMutationProps()
  const navigate = useNavigate()

  const isEnded = !!endedAt
  const hasRecurrenceEnabled = !!meetingSeries && !meetingSeries.cancelledAt
  const hasActiveMeetings = !!meetingSeries?.activeMeetings?.length
  const canStartRecurrence = !isEnded
  // for now user can end the recurrence only if the meeting is active, or if there are no active meetings in the series
  // it is somewhat arbitrary and might change in the future
  const canEndRecurrence = !isEnded || !hasActiveMeetings
  const canToggleRecurrence = hasRecurrenceEnabled ? canEndRecurrence : canStartRecurrence
  const hasUnsharedDraft = countUnsharedDrafts(responses, viewerId) > 0

  const items: TeamPromptOptionItem[] = []
  if (hasRecurrenceEnabled) {
    items.push({
      key: 'permalink',
      label: 'Copy meeting permalink',
      icon: <MuiLink className='text-fg-secondary' />,
      onClick: async () => {
        onCopied()
        const copyUrl = makeAppURL(window.location.origin, `meeting-series/${meetingId}`)
        await navigator.clipboard.writeText(copyUrl)
        SendClientSideEvent(atmosphere, 'Copied Meeting Series Link', {
          teamId: team?.id,
          meetingId: meetingId
        })
      }
    })
  }
  items.push({
    key: 'recurrence',
    label: hasRecurrenceEnabled ? 'Edit recurrence settings' : 'Start recurrence',
    icon: <Replay className='text-fg-secondary' />,
    isDisabled: !canToggleRecurrence,
    onClick: openRecurrenceSettingsModal
  })
  items.push({
    key: 'slack',
    label: 'Configure Slack',
    icon: <SlackSVG />,
    to: `/team/${team.id}/integrations#${getProviderAnchorId(Providers.SLACK_NAME)}`,
    isNewTab: true,
    onClick: () => {
      SendClientSideEvent(atmosphere, 'Configure Slack Standup Clicked', {
        teamId: team?.id,
        meetingId: meetingId
      })
    }
  })
  if (template?.viewerLowestScope === 'TEAM') {
    items.push({
      key: 'template',
      label: 'Edit template',
      icon: <Edit className='text-fg-secondary' />,
      to: `/activity-library/details/${template.id}`
    })
  }
  items.push({
    key: 'end',
    label: 'End this meeting',
    icon: <Flag className='text-fg-secondary' />,
    isDisabled: isEnded,
    isDestructive: true,
    onClick: () => {
      if (hasRecurrenceEnabled || hasUnsharedDraft) {
        openEndRecurringMeetingModal()
      } else {
        EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError, navigate})
      }
    }
  })
  return items
}

export default useTeamPromptOptionItems
