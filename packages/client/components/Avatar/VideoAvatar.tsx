import {VideoAvatar_teamMember} from '../../__generated__/VideoAvatar_teamMember.graphql'
import React, {forwardRef, Ref, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MediaRoom from '../../utils/mediaRoom/MediaRoom'
import {PeersState, ProducersState, ConsumersState} from '../../utils/mediaRoom/reducerMediaRoom'
import useMedia from '~/hooks/useMedia'

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
  mediaRoom: MediaRoom | null
  onClick?: () => void
  onMouseEnter?: () => void
  peers: PeersState
  producers: ProducersState
  consumers: ConsumersState
}

const VideoAvatar = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const {teamMember, /*mediaRoom,*/ peers, producers, consumers} = props
  const {isSelf, picture, userId} = teamMember
  const useMediaArgs = {isSelf, userId, peers, producers, consumers}
  const videoEnabled = useMedia({
    kind: 'video',
    mediaRef: videoRef,
    ...useMediaArgs
  })
  const audioEnabled = useMedia({
    kind: 'audio',
    mediaRef: audioRef,
    ...useMediaArgs
  })
  return (
    <AvatarStyle ref={ref}>
      <Picture src={picture} isHidden={videoEnabled} />
      <Video ref={videoRef} isHidden={!videoEnabled} autoPlay muted={isSelf} />
      <audio ref={audioRef} autoPlay muted={isSelf || audioEnabled} controls={false} />
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
