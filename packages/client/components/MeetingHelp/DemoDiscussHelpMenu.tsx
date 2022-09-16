import React, {forwardRef} from 'react'
import useInterval from '../../hooks/useInterval'
import DelayedCopy from './DelayedCopy'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuHeader from './HelpMenuHeader'

let permShow = 0

interface Props {}

const DemoDiscussHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  const staggerShow = useInterval(2000, 3)
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>Now Talk it Out</HelpMenuHeader>
      <DelayedCopy show={permShow} thresh={1}>
        Take action by assigning next steps.
      </DelayedCopy>
      <DelayedCopy show={permShow} thresh={2}>
        Track task progress with our Check-in meeting. (It’s Free!)
      </DelayedCopy>
      <DelayedCopy show={permShow} thresh={3} margin={'0'}>
        When you’re ready, end the demo to see the summary.
      </DelayedCopy>
    </HelpMenuContent>
  )
})

export default DemoDiscussHelpMenu
