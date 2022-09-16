import React, {forwardRef} from 'react'
import useInterval from '../../hooks/useInterval'
import DelayedCopy from './DelayedCopy'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuHeader from './HelpMenuHeader'

let permShow = 0
interface Props {}

const DemoGroupHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  const staggerShow = useInterval(2000, 2)
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
})

export default DemoGroupHelpMenu
