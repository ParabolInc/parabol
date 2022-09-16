import React, {forwardRef} from 'react'
import useInterval from '../../hooks/useInterval'
import DelayedCopy from './DelayedCopy'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuHeader from './HelpMenuHeader'

let permShow = 0

interface Props {}

const DemoReflectHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  const staggerShow = useInterval(2000, 3)
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>It Starts with Brutal Honesty</HelpMenuHeader>
      <DelayedCopy show={permShow} thresh={1}>
        The team just finished a sprint and is reflecting on how it went.
      </DelayedCopy>
      <DelayedCopy show={permShow} thresh={2}>
        Join in by typing in a few anonymous reflections into the boxes above.
      </DelayedCopy>
      <DelayedCopy show={permShow} thresh={3} margin={'0'}>
        When you’re ready to move on, hit the Next button below.
      </DelayedCopy>
    </HelpMenuContent>
  )
})

export default DemoReflectHelpMenu
