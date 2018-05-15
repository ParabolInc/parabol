import * as React from 'react'
import MeetingDashAlert from 'universal/components/MeetingDashAlert/MeetingDashAlert'
import ui from 'universal/styles/ui'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {ACTION} from 'universal/utils/constants'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'
import {DashLayout_viewer as Viewer} from './__generated__/DashLayout_viewer.graphql'

const StyledDashLayout = styled('div')({
  backgroundColor: '#fff',
  display: 'flex !important',
  flexDirection: 'column',
  height: '100vh',
  minWidth: ui.dashMinWidth
})

const ChildrenWrapper = styled('div')({
  display: 'flex !important',
  flex: 1,
  position: 'relative',
  height: '100%'
})

const getActiveMeetings = (viewer) => {
  const activeMeetings = []
  const teams = (viewer && viewer.teams) || []
  teams.forEach((team) => {
    const {meetingId, newMeeting} = team
    if (meetingId) {
      const meetingType = newMeeting ? newMeeting.meetingType : ACTION
      const meetingSlug = meetingTypeToSlug[meetingType]
      activeMeetings.push({
        link: `/${meetingSlug}/${team.id}`,
        name: team.name
      })
    }
  })
  return activeMeetings
}

type Props = {|
  children: React.Node,
  viewer: Viewer
|}

const DashLayout = (props: Props) => {
  const {children, viewer} = props
  const activeMeetings = getActiveMeetings(viewer)
  return (
    <StyledDashLayout>
      {/* Shows over any dashboard view when there is a meeting. */}
      {activeMeetings.length > 0 && <MeetingDashAlert activeMeetings={activeMeetings} />}
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </StyledDashLayout>
  )
}

export default createFragmentContainer(
  DashLayout,
  graphql`
    fragment DashLayout_viewer on User {
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
