import React from 'react'
import styled from 'react-emotion'
import {GROUP} from 'universal/utils/constants'
import {isDemoRoute} from 'universal/utils/demo'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const GroupHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
    {isDemoRoute ? (
      <React.Fragment>
        {/* Demo Help Content */}
        <HelpMenuCopy>
          The Demo Team is busy grouping common reflections for discussion. Anybody on the team can
          group.
        </HelpMenuCopy>
        <HelpMenuCopy>
          To group, drag and drop a card onto another card or group. Tap group headings to edit.
        </HelpMenuCopy>
        <StyledCopy>Try grouping a few yourself, then move forward.</StyledCopy>
      </React.Fragment>
    ) : (
      <React.Fragment>
        {/* Retro Help Content */}
        <HelpMenuCopy>
          The goal of this phase is to identify common themes and group them for discussion.
        </HelpMenuCopy>
        <HelpMenuCopy>To group, drag and drop a card onto another card or group.</HelpMenuCopy>
        <HelpMenuCopy>Tap group headings to edit.</HelpMenuCopy>
        <HelpMenuLink
          copy='Learn More'
          href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#group'
        />
      </React.Fragment>
    )}
  </HelpMenuContent>
)

export default withHelpMenu(GroupHelpMenu)
