import Link from '@mui/icons-material/Link'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {}

export const PageSharingCopyLink = (_props: Props) => {
  const handleCopyLink = () => {
    const urlWithoutParams = `${window.location.origin}${window.location.pathname}`
    navigator.clipboard.writeText(urlWithoutParams)
  }
  return (
    <>
      <hr className='m-0 mt-1 h-[1px] w-full bg-slate-300' />
      {/* pr-3.5 to line up with chevrons above */}
      <div className='flex justify-end px-7.5 py-2 font-medium text-sm'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopyLink}
              className='flex cursor-pointer items-center gap-1 text-sky-500 hover:text-sky-700'
            >
              <Link className='h-4 w-4' />
              <span>Copy link</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{'Copy link to clipboard'}</TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
