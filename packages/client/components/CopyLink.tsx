import React, {ReactNode} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'

interface Props {
  children: ReactNode
  title: string | undefined
  tooltip: string | undefined
  url: string
  onCopy?: () => void
}

const CopyLink = (props: Props) => {
  const {title, children, tooltip, url, onCopy} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip(
    MenuPosition.LOWER_CENTER
  )

  const handleCopy = () => {
    onCopy?.()

    if (tooltip) {
      openTooltip()
      setTimeout(() => {
        closeTooltip()
      }, 2000)
    }
  }
  return (
    <>
      <CopyToClipboard text={url} onCopy={handleCopy} title={title}>
        <span ref={originRef}>{children}</span>
      </CopyToClipboard>
      {tooltipPortal(tooltip)}
    </>
  )
}

export default CopyLink
