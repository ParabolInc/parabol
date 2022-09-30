import styled from '@emotion/styled'
import React from 'react'
import Ellipsis from '../Ellipsis/Ellipsis'
import HelpMenuCopy from './HelpMenuCopy'

const StyledHelpMenuCopy = styled(HelpMenuCopy)<{margin: string}>(({margin}) => ({margin}))

const DelayedCopyInner = styled('span')<{show: number; thresh: number}>(({show, thresh}) => ({
  opacity: show >= thresh ? 1 : 0,
  transform: show >= thresh ? 'translateY(0)' : 'translateY(10px)',
  transition: `all 500ms`
}))

const DelayedCopy = (props) => {
  const {children, show, thresh, margin} = props
  const showEllipsis = show === thresh - 1
  return (
    <StyledHelpMenuCopy margin={margin}>
      {showEllipsis && <Ellipsis />}
      <DelayedCopyInner show={show} thresh={thresh}>
        {children}
      </DelayedCopyInner>
    </StyledHelpMenuCopy>
  )
}
export default DelayedCopy
