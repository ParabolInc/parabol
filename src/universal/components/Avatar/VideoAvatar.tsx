import {VideoAvatar_teamMember} from '__generated__/VideoAvatar_teamMember.graphql'
import React, {useEffect, useRef, useState} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge'
import {StreamUI} from '../../hooks/useSwarm'

const AvatarStyle = styled('div')({
  cursor: 'pointer',
  display: 'inline-block',
  position: 'relative',
  verticalAlign: 'middle',
  width: 64
})

const BadgeBlock = styled('div')({
  height: '25%',
  position: 'absolute',
  right: 0,
  top: 0,
  width: '25%'
})

const BadgeBlockInner = styled('div')({
  height: '14px',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '14px'
})

const Video = styled('video')(({isHidden}: {isHidden: boolean}) => ({
  display: isHidden ? 'none' : undefined,
  borderRadius: '100%',
  objectFit: 'cover',
  transform: 'rotateY(180deg)'
}))

const Picture = styled('img')(({isHidden}: {isHidden: boolean}) => ({
  display: isHidden ? 'none' : undefined,
  borderRadius: '100%'
}))

interface Props {
  teamMember: VideoAvatar_teamMember
  streamUI: StreamUI | undefined
  onClick?: () => void
}

const VideoAvatar = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const {streamUI} = props
    if (!streamUI) return
    const {stream, show} = streamUI
    if (show) {
      videoRef.current!.srcObject = stream
    }
  })
  const {streamUI, teamMember, onClick} = props
  const {picture, isConnected, isSelf, meetingMember} = teamMember
  const isCheckedIn = meetingMember && meetingMember.isCheckedIn
  const showVideo = streamUI ? streamUI.show : false
  return (
    <AvatarStyle onClick={onClick}>
      <Picture src={picture} isHidden={showVideo} />
      <Video innerRef={videoRef} isHidden={!showVideo} width='64' height='64' autoPlay />
      <BadgeBlock>
        <BadgeBlockInner>
          <AvatarBadge isCheckedIn={isCheckedIn} isConnected={isConnected || isSelf} />
        </BadgeBlockInner>
      </BadgeBlock>
    </AvatarStyle>
  )
}

export default createFragmentContainer(
  VideoAvatar,
  graphql`
    fragment VideoAvatar_teamMember on TeamMember {
      meetingMember {
        isCheckedIn
      }
      isConnected
      isSelf
      picture
      userId
    }
  `
)
