import {DashAlertMeeting_viewer} from '../__generated__/DashAlertMeeting_viewer.graphql'
import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import DashAlertBar from './DashAlertBar'
import DashAlertLink from './DashAlertLink'
import {meetingTypeToSlug} from '../utils/meetings/lookups'
import plural from '../utils/plural'

const getActiveMeetings = (viewer) => {
  const activeMeetings: {link: string; name: string}[] = []
  const teams = (viewer && viewer.teams) || []
  teams.forEach((team) => {
    const {newMeeting} = team
    if (newMeeting) {
      const {meetingType} = newMeeting
      const meetingSlug = meetingTypeToSlug[meetingType]
      activeMeetings.push({
        link: `/${meetingSlug}/${team.id}`,
        name: team.name
      })
    }
  })
  return activeMeetings
}

const MessageBlock = styled('div')({
  fontWeight: 600
})

interface Props {
  viewer: DashAlertMeeting_viewer | null
}

const Link = styled(DashAlertLink)({
  paddingRight: 4
})

const DashAlertMeeting = (props: Props) => {
  const {viewer} = props
  const activeMeetings = useMemo(() => getActiveMeetings(viewer), [viewer])
  if (activeMeetings.length === 0) return null
  return (
    <DashAlertBar>
      <MessageBlock>{`${plural(activeMeetings.length, 'Meeting')} in progress:  `}</MessageBlock>
      {activeMeetings.map((meeting) => {
        return (
          <Link key={meeting.link} title='Join Meeting' to={meeting.link}>
            {meeting.name}
          </Link>
        )
      })}
    </DashAlertBar>
  )
}

export default createFragmentContainer(DashAlertMeeting, {
  viewer: graphql`
    fragment DashAlertMeeting_viewer on User {
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
})
