import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge'
import {VideoAvatar_teamMember} from '__generated__/VideoAvatar_teamMember.graphql'

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
  viewerStreams: Array<MediaStream> | undefined
  onClick?: () => void
}

class VideoAvatar extends Component<Props> {
  videoRef = React.createRef<HTMLVideoElement>()
  componentDidMount () {
    this.setSrc()
  }
  componentDidUpdate () {
    this.setSrc()
  }

  setSrc () {
    const {viewerStreams} = this.props
    const srcObject = viewerStreams ? viewerStreams[viewerStreams.length - 1] : null
    this.videoRef.current!.srcObject = srcObject
  }

  render () {
    const {teamMember, viewerStreams, onClick} = this.props
    const {picture, isConnected, isSelf, meetingMember} = teamMember
    const isCheckedIn = meetingMember && meetingMember.isCheckedIn
    const videoSrc = viewerStreams && viewerStreams[viewerStreams.length - 1]
    console.log('videoSrc', videoSrc)
    return (
      <AvatarStyle onClick={onClick}>
        <Picture src={picture} isHidden={!!viewerStreams} />
        <Video innerRef={this.videoRef} isHidden={!viewerStreams} width='64' height='64' autoPlay />
        <BadgeBlock>
          <BadgeBlockInner>
            <AvatarBadge isCheckedIn={isCheckedIn} isConnected={isConnected || isSelf} />
          </BadgeBlockInner>
        </BadgeBlock>
      </AvatarStyle>
    )
  }
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
