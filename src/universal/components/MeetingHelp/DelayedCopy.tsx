import styled from 'react-emotion'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import React from 'react'
import Ellipsis from 'universal/components/Ellipsis/Ellipsis'

const DelayedCopyInner = styled(HelpMenuCopy)(
  ({margin, show, thresh}: {show: number; margin: string; thresh: number}) => ({
    opacity: show >= thresh ? 1 : 0,
    transform: show >= thresh ? 'translateY(0)' : 'translateY(10px)',
    transition: `all 500ms`,
    margin
  })
)

const DelayedCopy = (props) => {
  const {children, show, thresh, margin} = props
  const showEllipsis = show === thresh - 1
  return (
    <React.Fragment>
      {showEllipsis && <Ellipsis />}
      <DelayedCopyInner show={show} thresh={thresh} margin={margin}>
        {children}
      </DelayedCopyInner>
    </React.Fragment>
  )
}
export default DelayedCopy
