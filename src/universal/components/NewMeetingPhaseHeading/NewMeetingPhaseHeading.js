/**
 * Renders the heading describing the current meeting phase.
 *
 * @flow
 */
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {meetingSidebarMediaQuery} from 'universal/styles/meeting'
import {phaseDescriptionLookup, phaseLabelLookup} from 'universal/utils/meetings/lookups'
import {createFragmentContainer} from 'react-relay'
import type {NewMeetingPhaseHeading_meeting as Meeting} from './__generated__/NewMeetingPhaseHeading_meeting.graphql'
import SidebarToggle from 'universal/components/SidebarToggle'

const HeadingBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '1.25rem 0 1rem'
})

const Toggle = styled(SidebarToggle)(({sidebarCollapsed}) => ({
  margin: '0 1rem 0 .5rem',

  [meetingSidebarMediaQuery]: {
    display: sidebarCollapsed ? 'block' : 'none'
  }
}))

const PhaseTitle = styled('h1')({
  fontSize: '1.25rem',
  lineHeight: '1.5',
  margin: 0
})

const PhaseDescription = styled('h2')({
  color: ui.labelHeadingColor,
  fontSize: '1rem',
  fontWeight: 'normal',
  margin: 0
})

type Props = {|
  sidebarCollapsed: boolean,
  meeting: Meeting,
  toggleSidebar: () => void
|}

const NewMeetingPhaseHeading = (props: Props) => {
  const {sidebarCollapsed, meeting, toggleSidebar} = props
  if (!meeting || !meeting.localPhase) return null
  const {
    localPhase: {phaseType}
  } = meeting
  const label = phaseLabelLookup[phaseType]
  const description = phaseDescriptionLookup[phaseType]
  const hasContent = label || description
  return (
    <HeadingBlock>
      <Toggle onClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      {hasContent && (
        <div>
          <PhaseTitle>{label}</PhaseTitle>
          <PhaseDescription>{description}</PhaseDescription>
        </div>
      )}
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
