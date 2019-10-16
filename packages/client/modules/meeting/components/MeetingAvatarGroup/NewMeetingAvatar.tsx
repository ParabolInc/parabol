import {NewMeetingAvatar_teamMember} from '../../../../__generated__/NewMeetingAvatar_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import VideoAvatar from '../../../../components/Avatar/VideoAvatar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import {StreamUI} from '../../../../hooks/useSwarm'
import MediaSwarm from '../../../../utils/swarm/MediaSwarm'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'

const Item = styled('div')({
  position: 'relative'
})

const AvatarBlock = styled('div')({
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
    height: 56,
    maxWidth: 56,
    width: 56
  }
})

interface Props {
  teamMember: NewMeetingAvatar_teamMember
  streamUI: StreamUI | undefined
  swarm: MediaSwarm | null
}

const NewMeetingAvatar = (props: Props) => {
  const {teamMember, streamUI, swarm} = props
  return (
    <ErrorBoundary>
      <Item>
        <AvatarBlock>
          <VideoAvatar teamMember={teamMember} streamUI={streamUI} swarm={swarm} />
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
