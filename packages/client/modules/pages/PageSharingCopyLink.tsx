import Link from '@mui/icons-material/Link'
import {Button} from '../../ui/Button/Button'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

export const PageSharingCopyLink = (_props: {}) => {
  const handleCopyLink = () => {
    const urlWithoutParams = `${window.location.origin}${window.location.pathname}`
    navigator.clipboard.writeText(urlWithoutParams)
  }

  return (
    <div className='flex justify-end'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCopyLink}
            variant='outline'
            shape='pill'
            className='flex items-center gap-1 pr-4 pl-3'
          >
            <Link className='h-6 w-6' />
            <span>Copy link</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{'Copy link to clipboard'}</TooltipContent>
      </Tooltip>
    </div>
  )
}
