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
import useStartMeetingSeriesNowMutation from '../mutations/useStartMeetingSeriesNowMutation'
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
        }
      }
    }
  }
`

const MeetingCardOptionsMenu = (props: Props) => {
  const {popTooltip, queryRef, openRecurrenceSettingsModal, openEndRecurringMeetingModal} = props
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
  const [startSeriesNow, isStartingSeries] = useStartMeetingSeriesNowMutation()

  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt
  const canStartSeriesNow =
    hasRecurrenceEnabled && !!endedAt && meetingSeries.ownerUserId === viewerId

  return (
    <>
      {hasRecurrenceEnabled && (
        <MenuItem
          onSelect={async () => {
            popTooltip()
            const copyUrl = makeAppURL(window.location.origin, `meeting-series/${meetingId}`)
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
        <MenuItem
          onSelect={() => {
            if (isStartingSeries) return
            startSeriesNow({
              variables: {meetingSeriesId: meetingSeries.id},
              onCompleted: (res) => {
                // an owner can schedule for teams they are not on, & cannot join those meetings
                const {meeting} = res.startMeetingSeriesNow
                if (meeting) {
                  navigate(`/meet/${meeting.id}`)
                  return
                }
                atmosphere.eventEmitter.emit('addSnackbar', {
                  key: 'startMeetingSeriesNow',
                  autoDismiss: 5,
                  showDismissButton: true,
                  message: 'Started the next meeting for each team'
                })
              }
            })
          }}
        >
          <PlayArrowIcon className={MENU_ITEM_ICON} />
          Start meeting now
        </MenuItem>
      )}
      {canManageMeeting && hasRecurrenceEnabled && (
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
