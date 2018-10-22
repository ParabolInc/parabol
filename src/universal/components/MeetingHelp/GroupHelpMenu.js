import React from 'react'
import {GROUP} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const GroupHelpMenu = ({closePortal, isFacilitating}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
    <HelpMenuCopy>
      The goal of this phase is to identify common themes and group them for discussion.
    </HelpMenuCopy>
    <HelpMenuCopy>
      To group, simply drag and drop a card onto another card or group. The automatic group titles
      can be tapped and edited.
    </HelpMenuCopy>
    {isFacilitating && (
      <HelpMenuCopy>
        <b>Facilitator</b>, check with the team to confirm that the groups make sense and everybody
        is ready to move on.
      </HelpMenuCopy>
    )}
    <HelpMenuLink
      copy='Learn More'
      href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#group'
    />
  </HelpMenuContent>
)

export default withHelpMenu(GroupHelpMenu)
