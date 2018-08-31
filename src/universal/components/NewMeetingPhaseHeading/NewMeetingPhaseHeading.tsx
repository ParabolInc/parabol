import {NewMeetingPhaseHeading_meeting} from '__generated__/NewMeetingPhaseHeading_meeting.graphql'
/**
 * Renders the heading describing the current meeting phase.
 *
 */
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import SidebarToggle from 'universal/components/SidebarToggle'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingSidebarMediaQuery} from 'universal/styles/meeting'
import ui from 'universal/styles/ui'
import {phaseDescriptionLookup, phaseLabelLookup} from 'universal/utils/meetings/lookups'
import {UnstartedMeeting} from '../../utils/meetings/unstartedMeeting'

const HeadingBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '1.25rem 0 1rem'
})

const Toggle = styled(SidebarToggle)(
  ({isMeetingSidebarCollapsed}: {isMeetingSidebarCollapsed: boolean}) => ({
    margin: '0 1rem 0 .5rem',

    [meetingSidebarMediaQuery]: {
      display: isMeetingSidebarCollapsed ? 'block' : 'none'
    }
  })
)

const PhaseTitle = styled('h1')({
  fontSize: '1.25rem',
  lineHeight: '1.5',
  margin: 0
})

const PhaseDescription = styled('h2')({
  color: ui.labelHeadingColor,
  display: 'none',
  fontWeight: 'normal',
  margin: 0,

  [minWidthMediaQueries[1]]: {
    display: 'block',
    fontSize: '.875rem'
  }
})

interface Props {
  meeting: NewMeetingPhaseHeading_meeting | UnstartedMeeting
  isMeetingSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const NewMeetingPhaseHeading = (props: Props) => {
  const {meeting, isMeetingSidebarCollapsed, toggleSidebar} = props
  const makeContent = () => {
    if (!meeting.localPhase) return null
    const {
      localPhase: {phaseType}
    } = meeting
    const label = phaseLabelLookup[phaseType]
    const description = phaseDescriptionLookup[phaseType]
    return (
      <div>
        <PhaseTitle>{label}</PhaseTitle>
        <PhaseDescription>{description}</PhaseDescription>
      </div>
    )
  }
  return (
    <HeadingBlock>
      <Toggle onClick={toggleSidebar} isMeetingSidebarCollapsed={isMeetingSidebarCollapsed} />
      {makeContent()}
    </HeadingBlock>
  )
}

export default createFragmentContainer(
  NewMeetingPhaseHeading,
  graphql`
    fragment NewMeetingPhaseHeading_meeting on NewMeeting {
      localPhase {
        phaseType
      }
    }
  `
)
