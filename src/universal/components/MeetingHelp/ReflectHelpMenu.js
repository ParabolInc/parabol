import React from 'react'
import {REFLECT} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const ReflectHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[REFLECT]}</HelpMenuHeader>
    <HelpMenuCopy>The goal of this phase is to gather honest input from the team.</HelpMenuCopy>
    <HelpMenuCopy>
      As a group, reflect on how work’s going for a specific project or timeframe.
    </HelpMenuCopy>
    <HelpMenuCopy>
      During this phase nobody can see your reflections. After this phase reflections will be
      visible, but remain anonymous.
    </HelpMenuCopy>
    <HelpMenuLink
      copy="Learn More"
      href="https://www.parabol.co/getting-started-guide/retrospective-meetings-101#reflect"
    />
  </HelpMenuContent>
)

export default withHelpMenu(ReflectHelpMenu)
