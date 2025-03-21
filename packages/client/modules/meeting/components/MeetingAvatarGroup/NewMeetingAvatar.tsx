import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NewMeetingAvatar_user$key} from '../../../../__generated__/NewMeetingAvatar_user.graphql'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {TransitionStatus} from '../../../../hooks/useTransition'
import {DECELERATE} from '../../../../styles/animation'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'

const Item = styled('div')({
  position: 'relative'
})

const Picture = styled('img')({
  borderRadius: '100%',
  height: '100%',
  objectFit: 'cover', // fill will squish it, cover cuts off the edges
  minHeight: '100%', // needed to not pancake in firefox
  width: '100%'
})

const AvatarBlock = styled('div')<{status: TransitionStatus}>(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `all 300ms ${DECELERATE}`,
  borderRadius: '100%',
  height: 32,
  maxWidth: 32,
  width: 32,
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    maxWidth: 48,
    width: 48
  },
  [meetingAvatarMediaQueries[1]]: {
    height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56,
    maxWidth: 56,
    width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56
  }
}))

interface Props {
  onTransitionEnd: () => void
  status: TransitionStatus
  userRef: NewMeetingAvatar_user$key
}

const NewMeetingAvatar = (props: Props) => {
  const {onTransitionEnd, status, userRef} = props

  const user = useFragment(
    graphql`
      fragment NewMeetingAvatar_user on User {
        id
        picture
        preferredName
      }
    `,
    userRef
  )

  const {preferredName, picture} = user
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <ErrorBoundary>
      <Item>
        <AvatarBlock
          ref={originRef}
          onMouseOver={openTooltip}
          onMouseLeave={closeTooltip}
          status={status}
          onTransitionEnd={onTransitionEnd}
        >
          <Picture src={picture} />
          {tooltipPortal(preferredName)}
        </AvatarBlock>
      </Item>
    </ErrorBoundary>
  )
}

export default NewMeetingAvatar
