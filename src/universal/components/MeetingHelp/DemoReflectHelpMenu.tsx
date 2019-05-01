import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import useInterval from 'universal/hooks/useInterval'
import DelayedCopy from './DelayedCopy'

let permShow = 0

interface Props {}

const DemoReflectHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  const staggerShow = useInterval(2000, 3)
  if (staggerShow > permShow) permShow = staggerShow
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>Welcome to the Parabol Retro Demo!</HelpMenuHeader>
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
