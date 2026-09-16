import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {
  Close as CloseIcon,
  Link,
  PersonAdd as PersonAddIcon,
  PlayArrow as PlayArrowIcon,
  Replay as ReplayIcon
} from '~/ui/icons'
import type {MeetingCardOptionsMenuQuery} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import {MENU_ITEM_ICON, MenuItem} from '../ui/Menu/MenuItem'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'
import makeAppURL from '../utils/makeAppURL'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import {EndMeetingMutationLookup} from './Recurrence/EndRecurringMeetingModal'

interface Props {
  popTooltip: () => void
  queryRef: PreloadedQuery<MeetingCardOptionsMenuQuery>
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
  onStartSeriesNow: () => void
}

const query = graphql`
  query MeetingCardOptionsMenuQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      id
      team(teamId: $teamId) {
        id
        massInvitation(meetingId: $meetingId) {
          id
        }
      }
      meeting(meetingId: $meetingId) {
        id
        meetingType
        facilitatorUserId
        endedAt
        meetingSeries {
          id
          cancelledAt
          ownerUserId
          groupId
          urlSlug
        }
      }
    }
  }
`

const MeetingCardOptionsMenu = (props: Props) => {
  const {
    popTooltip,
    queryRef,
    openRecurrenceSettingsModal,
    openEndRecurringMeetingModal,
    onStartSeriesNow
  } = props
  const data = usePreloadedQuery<MeetingCardOptionsMenuQuery>(query, queryRef)
  const {viewer} = data
  const {id: viewerId, team, meeting} = viewer
  const {massInvitation} = team!
  const {id: token} = massInvitation
  const {id: meetingId, meetingType, facilitatorUserId, endedAt, meetingSeries} = meeting!
  const isViewerFacilitator = facilitatorUserId === viewerId
  const canManageMeeting = meetingType === 'teamPrompt' || isViewerFacilitator
  const canEndMeeting = canManageMeeting && !endedAt
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const navigate = useNavigate()

  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt
  // an owned series answers to its owner alone, so the rest of the team cannot reschedule it
  const isSeriesManagedByOther =
    !!meetingSeries?.ownerUserId && meetingSeries.ownerUserId !== viewerId
  // whoever administers the series may open the next occurrence early, ending this one if it
  // is still running
  const canStartSeriesNow = hasRecurrenceEnabled && !isSeriesManagedByOther
  // a group is rescheduled as a whole from its group card, never one team at a time
  const canEditRecurrence =
    canManageMeeting && hasRecurrenceEnabled && !isSeriesManagedByOther && !meetingSeries.groupId

  return (
    <>
      {hasRecurrenceEnabled && (
        <MenuItem
          onSelect={async () => {
            popTooltip()
            const copyUrl = makeAppURL(
              window.location.origin,
              `meeting-series/${meetingSeries.urlSlug}`
            )
            await navigator.clipboard.writeText(copyUrl)

            SendClientSideEvent(atmosphere, 'Copied Meeting Series Link', {
              teamId: team?.id,
              meetingId: meetingId
            })
          }}
        >
          <Link className={MENU_ITEM_ICON} />
          Copy meeting permalink
        </MenuItem>
      )}
      <MenuItem
        onSelect={async () => {
          popTooltip()
          const copyUrl = getMassInvitationUrl(token)
          await navigator.clipboard.writeText(copyUrl)

          SendClientSideEvent(atmosphere, 'Copied Invite Link', {
            teamId: team?.id,
            meetingId: meetingId
          })
        }}
      >
        <PersonAddIcon className={MENU_ITEM_ICON} />
        Copy invite link
      </MenuItem>
      {canStartSeriesNow && (
        <MenuItem onSelect={onStartSeriesNow}>
          <PlayArrowIcon className={MENU_ITEM_ICON} />
          Start next meeting now
        </MenuItem>
      )}
      {canEditRecurrence && (
        <MenuItem onSelect={openRecurrenceSettingsModal}>
          <ReplayIcon className={MENU_ITEM_ICON} />
          Edit recurrence settings
        </MenuItem>
      )}
      {canEndMeeting && (
        <MenuItem
          onSelect={() => {
            if (!hasRecurrenceEnabled) {
              EndMeetingMutationLookup[meetingType]?.(
                atmosphere,
                {meetingId},
                {onError, onCompleted, navigate}
              )
            } else {
              openEndRecurringMeetingModal()
            }
          }}
        >
          <CloseIcon className={MENU_ITEM_ICON} />
          End this meeting
        </MenuItem>
      )}
    </>
  )
}

export default MeetingCardOptionsMenu
