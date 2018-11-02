import React from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import DelayedCopy from './DelayedCopy'
import withDemoHelpMenu from './withDemoHelpMenu'
import withStaggerShow from './withStaggerShow'

let permShow = 0

const DemoVoteHelpMenu = ({closePortal, staggerShow}) => {
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>To the Ballots!</HelpMenuHeader>
      <DelayedCopy show={permShow >= 1}>
        Anonymously vote for the topics you'd like to discuss
      </DelayedCopy>
      <DelayedCopy show={permShow >= 2} margin={'0'}>
        Cast up to 3 votes per group to get what you care about to the top!
      </DelayedCopy>
    </HelpMenuContent>
  )
}

export default withDemoHelpMenu(withHelpMenu(withStaggerShow(DemoVoteHelpMenu)))
