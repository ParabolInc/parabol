import {NewMeetingAvatar_teamMember} from '../../../../__generated__/NewMeetingAvatar_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import VideoAvatar from '../../../../components/Avatar/VideoAvatar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import MediaRoom from '../../../../utils/mediaRoom/MediaRoom'
import {
  PeersState,
  ProducersState,
  ConsumersState
} from '../../../../utils/mediaRoom/reducerMediaRoom'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'
import {TransitionStatus} from '../../../../hooks/useTransition'
import {DECELERATE} from '../../../../styles/animation'

const Item = styled('div')({
  position: 'relative'
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
  teamMember: NewMeetingAvatar_teamMember
  mediaRoom: MediaRoom | null
  peers: PeersState
  producers: ProducersState
  consumers: ConsumersState
}

const NewMeetingAvatar = (props: Props) => {
  const {teamMember, mediaRoom, onTransitionEnd, status, peers, producers, consumers} = props
  return (
    <ErrorBoundary>
      <Item>
        <AvatarBlock status={status} onTransitionEnd={onTransitionEnd}>
          <VideoAvatar
            teamMember={teamMember}
            mediaRoom={mediaRoom}
            peers={peers}
            producers={producers}
            consumers={consumers}
          />
        </AvatarBlock>
      </Item>
    </ErrorBoundary>
  )
}

export default createFragmentContainer(NewMeetingAvatar, {
  teamMember: graphql`
    fragment NewMeetingAvatar_teamMember on TeamMember {
      ...VideoAvatar_teamMember
    }
  `
})
