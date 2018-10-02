import {NewMeetingPhaseHeading_newMeeting} from '__generated__/NewMeetingPhaseHeading_newMeeting.graphql'
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
import UNSTARTED_MEETING from '../../utils/meetings/unstartedMeeting'

const HeadingBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '1.25rem 0 1rem'
})

const Toggle = styled(SidebarToggle)(
  ({isMeetingSidebarCollapsed}: {isMeetingSidebarCollapsed: boolean}) => ({
    margin: '.0625rem .75rem .0625rem .5rem',

    [meetingSidebarMediaQuery]: {
      display: isMeetingSidebarCollapsed ? 'flex' : 'none'
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
  newMeeting: NewMeetingPhaseHeading_newMeeting | null
  isMeetingSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const NewMeetingPhaseHeading = (props: Props) => {
  const {newMeeting, isMeetingSidebarCollapsed, toggleSidebar} = props
  const meeting = newMeeting || UNSTARTED_MEETING
  const makeLabels = () => {
    // only show labels during a live phase, not the lobby
    if (!meeting.localPhase) return null
    const {phaseType} = meeting.localPhase
    return (
      <div>
        <PhaseTitle>{phaseLabelLookup[phaseType]}</PhaseTitle>
        <PhaseDescription>{phaseDescriptionLookup[phaseType]}</PhaseDescription>
      </div>
    )
  }
  return (
    <HeadingBlock>
      <Toggle onClick={toggleSidebar} isMeetingSidebarCollapsed={isMeetingSidebarCollapsed} />
      {makeLabels()}
    </HeadingBlock>
  )
}

export default createFragmentContainer(
  NewMeetingPhaseHeading,
  graphql`
    fragment NewMeetingPhaseHeading_newMeeting on NewMeeting {
      localPhase {
        phaseType
      }
    }
  `
)
