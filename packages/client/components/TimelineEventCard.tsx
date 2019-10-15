import {TimelineEventCard_timelineEvent} from '../__generated__/TimelineEventCard_timelineEvent.graphql'
import React, {Component, ReactNode} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from './Icon'
import {buttonShadow, cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import TimelineEventDate from './TimelineEventDate'

// import PlainButton from 'universal/components/PlainButton/PlainButton'

interface Props {
  children: ReactNode
  iconName: string
  title: ReactNode
  timelineEvent: TimelineEventCard_timelineEvent
}

const Surface = styled('div')({
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 16,
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

const CardHeader = styled('div')({
  display: 'flex',
  margin: 16,
  position: 'relative'
})

const EventIcon = styled(Icon)({
  // explicit alignSelf & height for multi-line titles
  alignSelf: 'center',
  background: PALETTE.TEXT_GRAY,
  borderRadius: '100%',
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  display: 'block',
  fontSize: ICON_SIZE.MD24,
  height: 40,
  padding: 8,
  userSelect: 'none',
  width: 40
})

// const MenuIcon = styled(Icon)({
//   color: PALETTE.PRIMARY_MAIN,
//   position: 'absolute',
//   fontSize: ICON_SIZE.MD18,
//   top: 0,
//   right: 0,
//   userSelect: 'none'
// })

const HeaderText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16,
  justifyContent: 'space-around'
})

class TimelineEventCard extends Component<Props> {
  render() {
    const {children, iconName, title, timelineEvent} = this.props
    const {createdAt} = timelineEvent
    return (
      <Surface>
        <CardHeader>
          <EventIcon>{iconName}</EventIcon>
          <HeaderText>
            {title}
            <TimelineEventDate createdAt={createdAt} />
          </HeaderText>
          {/*<PlainButton>*/}
          {/*<MenuIcon>more_vert</MenuIcon>*/}
          {/*</PlainButton>*/}
        </CardHeader>
        {children}
      </Surface>
    )
  }
}

export default createFragmentContainer(TimelineEventCard, {
  timelineEvent: graphql`
    fragment TimelineEventCard_timelineEvent on TimelineEvent {
      id
      createdAt
    }
  `
})
