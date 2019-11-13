import {DashAlertMeeting_viewer} from '../__generated__/DashAlertMeeting_viewer.graphql'
import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DashAlertBar from './DashAlertBar'
import DashAlertLink from './DashAlertLink'
import plural from '../utils/plural'

const getActiveMeetings = (teams: DashAlertMeeting_viewer['teams']) => {
  const allActiveMeetings: {link: string; name: string}[] = []
  teams.forEach((team) => {
    const {activeMeetings} = team
    activeMeetings.forEach((activeMeeting) => {
      const {id: meetingId, name} = activeMeeting
      allActiveMeetings.push({
        link: `/meet/${meetingId}`,
        name
      })
    })
  })
  return allActiveMeetings
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
  const teams = viewer?.teams ?? []
  const activeMeetings = useMemo(() => getActiveMeetings(teams), [teams])
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

graphql`
  fragment DashAlertMeetingActiveMeetings on Team {
    activeMeetings {
      id
      meetingType
      name
    }
  }
`

export default createFragmentContainer(DashAlertMeeting, {
  viewer: graphql`
    fragment DashAlertMeeting_viewer on User {
      teams {
        ...DashAlertMeetingActiveMeetings @relay(mask: false)
      }
    }
  `
})
