import {useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Link} from '~/ui/icons'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import makeAppURL from '../../../utils/makeAppURL'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

interface Props {
  meetingId: string
  teamId: string
  responseId: string
}

const TeamPromptResponsePermalink = ({meetingId, teamId, responseId}: Props) => {
  const atmosphere = useAtmosphere()
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const permalink = makeAppURL(window.location.origin, `/meet/${meetingId}/responses`, {
    searchParams: {utm_source: 'sharing', responseId}
  })
  const handleCopy = () => {
    setIsCopied(true)
    SendClientSideEvent(atmosphere, 'Copied Standup Response Link', {teamId, meetingId})
    setTimeout(() => setIsCopied(false), 2000)
  }
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
