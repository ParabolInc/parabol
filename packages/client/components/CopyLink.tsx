import {type ReactNode, useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

interface Props {
  children: ReactNode
  title: string | undefined
  tooltip: string | undefined
  url: string
  onCopy?: () => void
}

const CopyLink = (props: Props) => {
  const {title, children, tooltip, url, onCopy} = props
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    if (tooltip) {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }

    onCopy && onCopy()
  }
  return (
    <Tooltip open={isCopied}>
      <CopyToClipboard text={url} onCopy={handleCopy} title={title}>
        <TooltipTrigger asChild>
          <span>{children}</span>
        </TooltipTrigger>
      </CopyToClipboard>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export default CopyLink
