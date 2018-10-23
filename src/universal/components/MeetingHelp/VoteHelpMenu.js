import React from 'react'
import styled from 'react-emotion'
import {VOTE} from 'universal/utils/constants'
import {isDemoRoute} from 'universal/utils/demo'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

const StyledCopy = styled(HelpMenuCopy)({margin: 0})

const VoteHelpMenu = ({closePortal}) => (
  <HelpMenuContent closePortal={closePortal}>
    <HelpMenuHeader>{phaseLabelLookup[VOTE]}</HelpMenuHeader>
    {isDemoRoute ? (
      <React.Fragment>
        {/* Demo Help Content */}
        <HelpMenuCopy>Here the Demo Team is voting on what they want to discuss.</HelpMenuCopy>
        <HelpMenuCopy>
          Each teammate has 5 total votes, and can vote on a single theme up to 3 times.
        </HelpMenuCopy>
        <HelpMenuCopy>
          To vote, simply tap on the check icon above the card. Toggle votes to remove.
        </HelpMenuCopy>
        <StyledCopy>Try voting on a few groups, then move forward.</StyledCopy>
      </React.Fragment>
    ) : (
      <React.Fragment>
        {/* Retro Help Content */}
        <HelpMenuCopy>
          The goal of this phase is to find signal on what topics are the most important to the
          team.
        </HelpMenuCopy>
        <HelpMenuCopy>
          Each teammate has 5 total votes, and can vote on a single theme up to 3 times.
        </HelpMenuCopy>
        <HelpMenuCopy>
          To vote, simply tap on the check icon above the card. Toggle votes to remove.
        </HelpMenuCopy>
        <HelpMenuLink
          copy='Learn More'
          href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#vote'
        />
      </React.Fragment>
    )}
  </HelpMenuContent>
)

export default withHelpMenu(VoteHelpMenu)
