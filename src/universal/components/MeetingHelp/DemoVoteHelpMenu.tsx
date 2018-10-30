import React from 'react'
import styled from 'react-emotion'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import {VOTE} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withDemoHelpMenu from './withDemoHelpMenu'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const VoteHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[VOTE]}</HelpMenuHeader>
    <HelpMenuCopy>Now the Demo Team is voting on what topics they want to discuss.</HelpMenuCopy>
    <HelpMenuCopy>
      Each teammate has 5 total votes, and can vote on a single group up to 3 times.
    </HelpMenuCopy>
    <HelpMenuCopy>
      To vote, simply tap on the thumb-up icon above a group. Toggle votes to remove.
    </HelpMenuCopy>
    <StyledCopy>Try voting on a few groups, then move forward.</StyledCopy>
  </HelpMenuContent>
)

export default withDemoHelpMenu(withHelpMenu(VoteHelpMenu))
