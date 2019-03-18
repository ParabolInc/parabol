import React from 'react'
import styled from 'react-emotion'
import MediaControlToggle from './MediaControlToggle'
import Icon from 'universal/components/Icon'

const Toggle = styled(MediaControlToggle)({})

interface Props {}

const VideoToggle = (props: Props) => {
  const onClick = () => {
    /**/
  }
  return (
    <Toggle>
      <Icon>videocam</Icon>
    </Toggle>
  )
}

export default VideoToggle
