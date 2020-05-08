import {TimelineEventCard_timelineEvent} from '../__generated__/TimelineEventCard_timelineEvent.graphql'
import React, {Component, ReactNode} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from './Icon'
import {cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import TimelineEventDate from './TimelineEventDate'
import TimelineEventFooterMenuToggle from './TimelineEventFooterMenuToggle'

// import PlainButton from 'universal/components/PlainButton/PlainButton'

interface Props {
  children: ReactNode
  iconName: string
  title: ReactNode
  timelineEvent: TimelineEventCard_timelineEvent
  meetingId?: string
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
  margin: '16px 16px 8px',
  position: 'relative',
  justifyContent: 'space-between'
})

const CardTitleBlock = styled('div')({
  display: 'flex'
})

const EventIcon = styled(Icon)({
  alignSelf: 'flex-start',
  borderRadius: '100%',
  color: PALETTE.TEXT_GRAY,
  display: 'block',
  fontSize: ICON_SIZE.MD24,
  height: 24,
  userSelect: 'none',
  width: 24
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
  fontSize: 14,
  justifyContent: 'space-around',
  lineHeight: '20px',
  paddingLeft: 16,
  paddingTop: 2
})

class TimelineEventCard extends Component<Props> {
  render() {
    const {children, iconName, title, timelineEvent, meetingId} = this.props
    const {id: timelineEventId, createdAt, type, teamId} = timelineEvent
    return (
      <Surface>
        <CardHeader>
          <CardTitleBlock>
            <EventIcon>{iconName}</EventIcon>
            <HeaderText>
              {title}
              <TimelineEventDate createdAt={createdAt} />
            </HeaderText>
          </CardTitleBlock>

          {/*<PlainButton>*/}
          {/*<MenuIcon>more_vert</MenuIcon>*/}
          {/*</PlainButton>*/}

          {type == 'retroComplete' || type == 'actionComplete' ? (
            <TimelineEventFooterMenuToggle
              timelineEventId={timelineEventId}
              meetingId={meetingId as string}
              teamId={teamId as string}
            />
          ) : null}
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
      type
      teamId
    }
  `
})
