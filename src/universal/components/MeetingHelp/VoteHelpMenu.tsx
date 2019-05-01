import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'
import {VOTE} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'

interface Props {}

const VoteHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[VOTE]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to find signal on what topics are the most important to the team.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Each teammate has 5 total votes, and can vote on a single group up to 3 times.
      </HelpMenuCopy>
      <HelpMenuCopy>
        To vote, simply tap on the thumb-up icon above a group. Toggle votes to remove.
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#vote'
      />
    </HelpMenuContent>
  )
})

export default VoteHelpMenu
