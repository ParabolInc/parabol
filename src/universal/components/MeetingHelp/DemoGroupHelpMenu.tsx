import React from 'react'
import styled from 'react-emotion'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import {GROUP} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withDemoHelpMenu from './withDemoHelpMenu'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const DemoGroupHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
    <HelpMenuCopy>
      The Demo Team is busy grouping common reflections for discussion. Anybody on the team can
      group.
    </HelpMenuCopy>
    <HelpMenuCopy>
      To group, drag and drop a card onto another card or group. Tap group headings to edit.
    </HelpMenuCopy>
    <StyledCopy>Try grouping a few yourself, then move forward.</StyledCopy>
  </HelpMenuContent>
)

export default withDemoHelpMenu(withHelpMenu(DemoGroupHelpMenu))
