import React from 'react'
import styled from 'react-emotion'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import {DISCUSS} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withDemoHelpMenu from './withDemoHelpMenu'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const DemoDiscussHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[DISCUSS]}</HelpMenuHeader>
    <HelpMenuCopy>
      Here the Demo Team is creating takeaway tasks based on the current topic.
    </HelpMenuCopy>
    <HelpMenuCopy>
      Try creating a task. Tap the avatar on the task to assign it to somebody else on the team.
    </HelpMenuCopy>
    <StyledCopy>
      End the meeting to see a summary. The summary is emailed to everyone on the team.
    </StyledCopy>
  </HelpMenuContent>
)

export default withDemoHelpMenu(withHelpMenu(DemoDiscussHelpMenu))
