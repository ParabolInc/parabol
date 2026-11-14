import {useEffect, useRef, useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Link} from '~/ui/icons'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import makeAppURL from '../../../utils/makeAppURL'

const COPIED_DURATION_MS = 2000

interface Props {
  meetingId: string
  responseId: string
}

const TeamPromptResponsePermalink = ({meetingId, responseId}: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const permalink = makeAppURL(window.location.origin, `/meet/${meetingId}/responses`, {
    searchParams: {utm_source: 'sharing', responseId}
  })
  const copyTimerRef = useRef<number | null>(null)
  const handleCopy = () => {
    setIsCopied(true)
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setIsCopied(false), COPIED_DURATION_MS)
  }
  useEffect(
    () => () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    },
    []
  )
  return (
    <Tooltip open={isCopied || isHovered} onOpenChange={setIsHovered}>
      <CopyToClipboard text={permalink} onCopy={handleCopy}>
        <TooltipTrigger asChild>
          <button
            type='button'
            aria-label='Copy permalink'
            className='ml-auto h-7 rounded-md bg-transparent p-0 text-fg-secondary hover:bg-surface-hover hover:text-fg-primary'
          >
            <Link className='h-7 w-7 cursor-pointer p-0.5' />
          </button>
        </TooltipTrigger>
      </CopyToClipboard>
      <TooltipContent side={isCopied ? 'top' : 'bottom'}>
        {isCopied ? 'Copied!' : 'Copy permalink'}
      </TooltipContent>
    </Tooltip>
  )
}

export default TeamPromptResponsePermalink
