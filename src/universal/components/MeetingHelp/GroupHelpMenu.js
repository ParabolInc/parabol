import React from 'react'
import {GROUP} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const GroupHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
    <HelpMenuCopy>
      The goal of this phase is to identify common themes and group them for discussion.
    </HelpMenuCopy>
    <HelpMenuCopy>To group, drag and drop a card onto another card or group.</HelpMenuCopy>
    <HelpMenuCopy>Tap group headings to edit.</HelpMenuCopy>
    <HelpMenuLink
      copy="Learn More"
      href="https://www.parabol.co/getting-started-guide/retrospective-meetings-101#group"
    />
  </HelpMenuContent>
)

export default withHelpMenu(GroupHelpMenu)
