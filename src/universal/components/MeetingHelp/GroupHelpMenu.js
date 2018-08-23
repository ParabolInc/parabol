import React from 'react'
import {GROUP} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuBody from 'universal/components/MeetingHelp/HelpMenuBody'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const GroupHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
    <HelpMenuBody>
      <p>{'The goal of this phase is to identify common themes and group them for discussion.'}</p>
      <p>{'To group, simply drag and drop a card onto another card or group.'}</p>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#group'
      />
    </HelpMenuBody>
  </HelpMenuContent>
)

export default withHelpMenu(GroupHelpMenu)
