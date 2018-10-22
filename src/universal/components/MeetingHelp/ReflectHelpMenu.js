import React from 'react'
import {REFLECT} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const ReflectHelpMenu = ({closePortal, isFacilitating}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[REFLECT]}</HelpMenuHeader>
    <HelpMenuCopy>
      The goal of this phase is to gather honest input from the team for a specific context (eg.
      project, timeframe, etc.)
    </HelpMenuCopy>
    <HelpMenuCopy>
      During this phase nobody can see your reflections. After this phase reflections will be
      visible, but remain anonymous.
    </HelpMenuCopy>
    {isFacilitating && (
      <HelpMenuCopy>
        <b>Facilitator</b>, check with the team to see if everyone is finished writing, then press
        “Done! Let’s Group” to move on.
      </HelpMenuCopy>
    )}
    <HelpMenuLink
      copy='Learn More'
      href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#reflect'
    />
  </HelpMenuContent>
)

export default withHelpMenu(ReflectHelpMenu)
