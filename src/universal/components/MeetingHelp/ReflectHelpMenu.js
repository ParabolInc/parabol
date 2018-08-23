import React from 'react'
import {REFLECT} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuBody from 'universal/components/MeetingHelp/HelpMenuBody'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const ReflectHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[REFLECT]}</HelpMenuHeader>
    <HelpMenuBody>
      <p>{'The goal of this phase is to gather honest input from the team.'}</p>
      <p>{'As a group, reflect on projects for a specific timeframe.'}</p>
      <p>
        {
          'Reflection cards will remain blurred from other teammates until everyone has completed the phase.'
        }
      </p>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#reflect'
      />
    </HelpMenuBody>
  </HelpMenuContent>
)

export default withHelpMenu(ReflectHelpMenu)
