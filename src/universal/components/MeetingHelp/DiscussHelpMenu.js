import React from 'react'
import {DISCUSS} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuBody from 'universal/components/MeetingHelp/HelpMenuBody'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const DiscussHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[DISCUSS]}</HelpMenuHeader>
    <HelpMenuBody>
      <p>
        {
          'The goal of this phase is to identify next steps and capture them as task cards assigned to an owner.'
        }
      </p>
      <p>
        {
          'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'
        }
      </p>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#discuss'
      />
    </HelpMenuBody>
  </HelpMenuContent>
)

export default withHelpMenu(DiscussHelpMenu)
