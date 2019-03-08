import React from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import DelayedCopy from './DelayedCopy'
import withDemoHelpMenu from './withDemoHelpMenu'
import withStaggerShow from './withStaggerShow'

let permShow = 0
const DemoGroupHelpMenu = ({closePortal, staggerShow}) => {
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>Grouping Time!</HelpMenuHeader>
      <DelayedCopy show={permShow} thresh={1}>
        Join in by grouping cards and perfecting the titles.
      </DelayedCopy>
      <DelayedCopy show={permShow} thresh={2} margin={'0'}>
        Parabol’s collaborative drag and drop let’s you work together seamlessly.
      </DelayedCopy>
    </HelpMenuContent>
  )
}

export default withDemoHelpMenu(withHelpMenu(withStaggerShow(DemoGroupHelpMenu)))
