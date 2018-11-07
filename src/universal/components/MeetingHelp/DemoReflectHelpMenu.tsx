import React from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import withHelpMenu from 'universal/components/MeetingHelp/withHelpMenu'
import DelayedCopy from './DelayedCopy'
import withDemoHelpMenu from './withDemoHelpMenu'
import withStaggerShow from './withStaggerShow'

interface Props {
  closePortal: () => void
  staggerShow: number
}

let permShow = 0

function ReflectHelpMenu (props: Props) {
  const {closePortal, staggerShow} = props
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>Welcome to the Parabol Retro Demo!</HelpMenuHeader>
      <DelayedCopy show={permShow >= 1}>
        The team just finished a sprint and is reflecting on how it went.
      </DelayedCopy>
      <DelayedCopy show={permShow >= 2}>
        Join in by typing in a few anonymous reflections into the boxes above.
      </DelayedCopy>
      <DelayedCopy show={permShow >= 3} margin={'0'}>
        When you're ready, hit the Next button, below.
      </DelayedCopy>
    </HelpMenuContent>
  )
}

export default withDemoHelpMenu(withHelpMenu(withStaggerShow(ReflectHelpMenu)))
