import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'
import getRallyLink from '../modules/userDashboard/helpers/getRallyLink'

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 64
})

const ThumbsUp = styled(Icon)({
  fontSize: ICON_SIZE.MD48,
  marginBottom: 16
})

const RallyLink = styled('span')({
  fontWeight: 600,
  color: PALETTE.LINK_BLUE
})

const TimelineNoTasks = () => {
  return (
    <Wrapper>
      <ThumbsUp>thumb_up</ThumbsUp>
      {'You’re all caught up!'}
      <RallyLink>{getRallyLink()}</RallyLink>
    </Wrapper>
  )
}

export default TimelineNoTasks
