import {VideoAvatar_teamMember} from '../../__generated__/VideoAvatar_teamMember.graphql'
import React, {forwardRef, Ref, useEffect, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StreamUI} from '../../hooks/useSwarm'
import MediaSwarm from '../../utils/swarm/MediaSwarm'

const AvatarStyle = styled('div')({
  height: '100%', // needed to not pancake in firefox
  position: 'relative',
  width: '100%'
})

interface StyleProps {
  isHidden: boolean
}
const Video = styled('video')<StyleProps>(({isHidden}) => ({
  display: isHidden ? 'none' : undefined,
  borderRadius: '100%',
  height: '100%',
  objectFit: 'cover', // fill will squish it, cover cuts off the edges
  minHeight: '100%', // needed to not pancake in firefox
  transform: 'rotateY(180deg)',
  width: '100%'
}))

const Picture = styled('img')<StyleProps>(({isHidden}) => ({
  display: isHidden ? 'none' : undefined,
  borderRadius: '100%',
  height: '100%',
  objectFit: 'cover', // fill will squish it, cover cuts off the edges
  minHeight: '100%', // needed to not pancake in firefox
  width: '100%'
}))

interface Props {
  teamMember: VideoAvatar_teamMember
  streamUI: StreamUI | undefined
  swarm: MediaSwarm | null
  onClick?: () => void
  onMouseEnter?: () => void
}

const VideoAvatar = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const {streamUI, teamMember, swarm} = props
  const {isSelf, picture, userId} = teamMember
  useEffect(() => {
    if (!streamUI) return
    const {hasVideo} = streamUI
    if (hasVideo && swarm) {
      const el = videoRef.current!
      const stream = isSelf ? swarm.localStreams.cam.low : swarm.getStream('cam', userId)
      console.log('hasVideo', stream, hasVideo)
      if (el.srcObject !== stream) {
        // conditional is required to remove flickering video on update
        el.srcObject = stream
      }
    }
  })
  const showVideo = streamUI ? streamUI.hasVideo : false
  return (
    <AvatarStyle ref={ref}>
      <Picture src={picture} isHidden={showVideo} />
      <Video ref={videoRef} isHidden={!showVideo} autoPlay muted={isSelf} />
    </AvatarStyle>
  )
})

export default createFragmentContainer(VideoAvatar, {
  teamMember: graphql`
    fragment VideoAvatar_teamMember on TeamMember {
      isSelf
      picture
      userId
    }
  `
})
