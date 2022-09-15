import React, {forwardRef} from 'react'
import useInterval from '../../hooks/useInterval'
import DelayedCopy from './DelayedCopy'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuHeader from './HelpMenuHeader'

let permShow = 0

interface Props {}

const DemoVoteHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  const staggerShow = useInterval(2000, 2)
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>To the Ballots!</HelpMenuHeader>
      <DelayedCopy show={permShow} thresh={1}>
        Anonymously vote for the topics you’d like to discuss.
      </DelayedCopy>
      <DelayedCopy show={permShow} thresh={2} margin={'0'}>
        Cast up to 3 votes per group to get what you care about prioritized for the discussion to
        come!
      </DelayedCopy>
    </HelpMenuContent>
  )
})

export default DemoVoteHelpMenu
