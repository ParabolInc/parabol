import React from 'react'
import styled from 'react-emotion'
import {DISCUSS} from 'universal/utils/constants'
import {isDemoRoute} from 'universal/utils/demo'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const DiscussHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[DISCUSS]}</HelpMenuHeader>
    {isDemoRoute ? (
      <React.Fragment>
        {/* Demo Help Content */}
        <HelpMenuCopy>
          Here the Demo Team is creating takeaway tasks based on the current topic.
        </HelpMenuCopy>
        <HelpMenuCopy>
          Try creating a task. Tap the avatar on the task to assign it to somebody else on the team.
        </HelpMenuCopy>
        <StyledCopy>
          End the meeting to see a summary. The summary is emailed to everyone on the team.
        </StyledCopy>
      </React.Fragment>
    ) : (
      <React.Fragment>
        {/* Retro Help Content */}
        <HelpMenuCopy>
          The goal of this phase is to identify next steps and capture them as task cards assigned
          to an owner.
        </HelpMenuCopy>
        <HelpMenuCopy>
          Sometimes the next task is to schedule a time to discuss a topic more in depth at a later
          time.
        </HelpMenuCopy>
        <HelpMenuLink
          copy='Learn More'
          href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#discuss'
        />
      </React.Fragment>
    )}
  </HelpMenuContent>
)

export default withHelpMenu(DiscussHelpMenu)
