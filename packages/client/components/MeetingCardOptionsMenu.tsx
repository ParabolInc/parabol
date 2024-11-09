import styled from '@emotion/styled'
import {
  Close as CloseIcon,
  Link,
  PersonAdd as PersonAddIcon,
  Replay as ReplayIcon
} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import {MeetingCardOptionsMenuQuery} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'
import makeAppURL from '../utils/makeAppURL'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuItemLabelStyle} from './MenuItemLabel'
import {EndMeetingMutationLookup} from './Recurrence/EndRecurringMeetingModal'

interface Props {
  menuProps: MenuProps
  popTooltip: () => void
  queryRef: PreloadedQuery<MeetingCardOptionsMenuQuery>
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const StyledIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 24,
  width: 24,
  svg: {
    fontSize: 24
  },
  marginRight: 8
})

const LinkIcon = styled(Link)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  minWidth: '200px'
})

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
        meetingSeries {
          cancelledAt
        }
      }
    }
  }
`

const MeetingCardOptionsMenu = (props: Props) => {
  const {
    menuProps,
    popTooltip,
    queryRef,
    openRecurrenceSettingsModal,
    openEndRecurringMeetingModal
  } = props
  const data = usePreloadedQuery<MeetingCardOptionsMenuQuery>(query, queryRef)
  const {viewer} = data
  const {id: viewerId, team, meeting} = viewer
  const {massInvitation} = team!
  const {id: token} = massInvitation
  const {id: meetingId, meetingType, facilitatorUserId, meetingSeries} = meeting!
  const isViewerFacilitator = facilitatorUserId === viewerId
  const canEndMeeting = meetingType === 'teamPrompt' || isViewerFacilitator
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {history} = useRouter()

  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  const {closePortal} = menuProps
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
            popTooltip()
            closePortal()
            const copyUrl = makeAppURL(window.location.origin, `meeting-series/${meetingId}`)
            await navigator.clipboard.writeText(copyUrl)

            SendClientSideEvent(atmosphere, 'Copied Meeting Series Link', {
              teamId: team?.id,
              meetingId: meetingId
            })
          }}
        />
      )}
      <MenuItem
        key='copy'
        label={
          <OptionMenuItem>
            <StyledIcon>
              <PersonAddIcon />
            </StyledIcon>
            <span>{'Copy invite link'}</span>
          </OptionMenuItem>
        }
        onClick={async () => {
          popTooltip()
          closePortal()
          const copyUrl = getMassInvitationUrl(token)
          await navigator.clipboard.writeText(copyUrl)

          SendClientSideEvent(atmosphere, 'Copied Invite Link', {
            teamId: team?.id,
            meetingId: meetingId
          })
        }}
      />
      {canEndMeeting && hasRecurrenceEnabled && (
        <MenuItem
          key='edit-recurrence'
          label={
            <OptionMenuItem>
              <StyledIcon>
                <ReplayIcon />
              </StyledIcon>
              <span>{'Edit recurrence settings'}</span>
            </OptionMenuItem>
          }
          onClick={() => {
            closePortal()
            openRecurrenceSettingsModal()
          }}
        />
      )}
      {canEndMeeting && (
        <MenuItem
          key='close'
          label={
            <OptionMenuItem>
              <StyledIcon>
                <CloseIcon />
              </StyledIcon>
              <span>{'End this meeting'}</span>
            </OptionMenuItem>
          }
          onClick={() => {
            closePortal()
            if (!hasRecurrenceEnabled) {
              EndMeetingMutationLookup[meetingType]?.(
                atmosphere,
                {meetingId},
                {onError, onCompleted, history}
              )
            } else {
              openEndRecurringMeetingModal()
            }
          }}
        />
      )}
    </Menu>
  )
}

export default MeetingCardOptionsMenu
