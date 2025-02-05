import {Delete, Edit, Link} from '@mui/icons-material'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

export type Props = {
  url: string
  onEdit: () => void
  onClear: () => void
}

export const TipTapLinkPreview = (props: Props) => {
  const {onClear, onEdit, url} = props
  return (
    <div
      className={
        'flex items-center justify-center truncate rounded-md bg-white p-1 text-sm shadow-lg'
      }
    >
      <Link className='flex-none pr-1 text-base text-slate-700' />
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='max-w-64 truncate text-sm break-all underline'
      >
        {url}
      </a>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={
              'flex cursor-pointer appearance-none items-center justify-center bg-transparent p-1'
            }
            aria-label='Edit'
          >
            <Edit onClick={onEdit} className='text-base' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          {'Edit link'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={
              'flex cursor-pointer appearance-none items-center justify-center bg-transparent p-1'
            }
            aria-label='Remove link'
          >
            <Delete onClick={onClear} className='text-base' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          {'Remove link'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
