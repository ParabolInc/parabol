import React from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import DelayedCopy from './DelayedCopy'
import withDemoHelpMenu from './withDemoHelpMenu'
import withStaggerShow from './withStaggerShow'

let permShow = 0

const DemoDiscussHelpMenu = ({closePortal, staggerShow}) => {
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>Now Talk it Out</HelpMenuHeader>
      <DelayedCopy show={permShow >= 1}>Take action by assigning next steps</DelayedCopy>
      <DelayedCopy show={permShow >= 1}>
        Track task progress with our Action meeting (It's Free!)
      </DelayedCopy>
      <DelayedCopy show={permShow >= 2} margin={'0'}>
        When you're ready, end the demo to see the summary
      </DelayedCopy>
    </HelpMenuContent>
  )
}

export default withDemoHelpMenu(withHelpMenu(withStaggerShow(DemoDiscussHelpMenu)))
