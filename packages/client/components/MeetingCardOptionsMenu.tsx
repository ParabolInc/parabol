import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {
  Close as CloseIcon,
  Link,
  PersonAdd as PersonAddIcon,
  Replay as ReplayIcon
} from '~/ui/icons'
import type {MeetingCardOptionsMenuQuery} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import type {MenuProps} from '../hooks/useMenu'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'
import makeAppURL from '../utils/makeAppURL'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {EndMeetingMutationLookup} from './Recurrence/EndRecurringMeetingModal'

interface Props {
  menuProps: MenuProps
  popTooltip: () => void
  queryRef: PreloadedQuery<MeetingCardOptionsMenuQuery>
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const StyledIcon = (props: {children: ReactNode}) => (
  <div className='mr-2 h-6 w-6 text-fg-secondary [&_svg]:text-[24px]'>{props.children}</div>
)

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
  const {id: meetingId, meetingType, facilitatorUserId, endedAt, meetingSeries} = meeting!
  const isViewerFacilitator = facilitatorUserId === viewerId
  const canManageMeeting = meetingType === 'teamPrompt' || isViewerFacilitator
  const canEndMeeting = canManageMeeting && !endedAt
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const navigate = useNavigate()

  const hasRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  const {closePortal} = menuProps
  return (
    <Menu ariaLabel={'Edit the meeting'} {...menuProps}>
      {hasRecurrenceEnabled && (
        <MenuItem
          key='link'
          label={
            <MenuItemLabel className='min-w-[200px]'>
              <Link className='mr-2 text-fg-secondary' />
              Copy meeting permalink
            </MenuItemLabel>
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
          <MenuItemLabel className='min-w-[200px]'>
            <StyledIcon>
              <PersonAddIcon />
            </StyledIcon>
            <span>{'Copy invite link'}</span>
          </MenuItemLabel>
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
      {canManageMeeting && hasRecurrenceEnabled && (
        <MenuItem
          key='edit-recurrence'
          label={
            <MenuItemLabel className='min-w-[200px]'>
              <StyledIcon>
                <ReplayIcon />
              </StyledIcon>
              <span>{'Edit recurrence settings'}</span>
            </MenuItemLabel>
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
            <MenuItemLabel className='min-w-[200px]'>
              <StyledIcon>
                <CloseIcon />
              </StyledIcon>
              <span>{'End this meeting'}</span>
            </MenuItemLabel>
          }
          onClick={() => {
            closePortal()
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
        />
      )}
    </Menu>
  )
}

export default MeetingCardOptionsMenu
