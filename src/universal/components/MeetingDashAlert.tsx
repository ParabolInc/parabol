import {MeetingDashAlert_viewer} from '__generated__/MeetingDashAlert_viewer.graphql'
import React, {useEffect, useMemo, useState} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {Link} from 'react-router-dom'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import plural from 'universal/utils/plural'
import {PALETTE} from '../styles/paletteV2'
import {MeetingTypes} from '../types/constEnums'

const getActiveMeetings = (viewer) => {
  const activeMeetings: {link: string; name: string}[] = []
  const teams = (viewer && viewer.teams) || []
  teams.forEach((team) => {
    const {meetingId, newMeeting} = team
    if (meetingId) {
      const meetingType = newMeeting ? newMeeting.meetingType : MeetingTypes.ACTION
      const meetingSlug = meetingTypeToSlug[meetingType]
      activeMeetings.push({
        link: `/${meetingSlug}/${team.id}`,
        name: team.name
      })
    }
  })
  return activeMeetings
}

const Alert = styled('div')(
  {
    backgroundColor: PALETTE.BACKGROUND.RED,
    color: '#fff',
    fontSize: 18,
    lineHeight: '22px',
    padding: '10px 16px',
    transition: 'opacity 200ms',
    textAlign: 'center',
    userSelect: 'none',
    width: '100%'
  },
  ({isFixed}: {isFixed: boolean}) =>
    isFixed && {
      alignSelf: 'center',
      borderRadius: '42px',
      opacity: 0.5,
      width: 'auto',
      zIndex: 1,
      ':hover': {
        opacity: 1
      }
    }
)

const Block = styled('div')({
  display: 'inline-block',
  margin: '0 16px',
  verticalAlign: 'top'
})

const MessageBlock = styled(Block)({
  fontWeight: 600,
  paddingLeft: 16
})

const StyledLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'underline',
  ':hover, :focus': {
    color: 'inherit',
    opacity: 0.5
  },
  paddingRight: '1rem'
})

interface Props {
  viewer: MeetingDashAlert_viewer | null
}

// todo get reference to get dynamic height
const ALERT_HEIGHT = 42
const ALERT_TOP_PADDING = 16
const getTranslate = (y: number) =>
  y < ALERT_HEIGHT
    ? 0
    : y < ALERT_HEIGHT * 2
    ? ((y - ALERT_HEIGHT) * (ALERT_HEIGHT * 2 + ALERT_TOP_PADDING)) / ALERT_HEIGHT
    : y + ALERT_TOP_PADDING

const MeetingDashAlert = (props: Props) => {
  const {viewer} = props
  const activeMeetings = useMemo(() => getActiveMeetings(viewer), [viewer])
  const [scrollY, setScrollY] = useState(window.scrollY)
  useEffect(() => {
    const handler = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handler, {passive: true})
    return () => window.removeEventListener('scroll', handler)
  })
  if (activeMeetings.length === 0) return null
  return (
    <Alert
      isFixed={scrollY > ALERT_HEIGHT}
      style={{transform: `translateY(${getTranslate(scrollY)}px)`}}
    >
      <MessageBlock>{`${plural(activeMeetings.length, 'Meeting')} in progress:`}</MessageBlock>
      <Block>
        {activeMeetings.map((meeting) => {
          return (
            <StyledLink key={meeting.link} title='Join Active Meeting' to={meeting.link}>
              {meeting.name}
            </StyledLink>
          )
        })}
      </Block>
    </Alert>
  )
}

export default createFragmentContainer(
  MeetingDashAlert,
  graphql`
    fragment MeetingDashAlert_viewer on User {
      teams {
        id
        meetingId
        newMeeting {
          id
          meetingType
        }
        name
      }
    }
  `
)
