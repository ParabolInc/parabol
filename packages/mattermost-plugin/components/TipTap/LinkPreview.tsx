import {Delete, Edit, Link} from '@mui/icons-material'
import {Tooltip} from 'parabol-client/ui/Tooltip/Tooltip'
import {TooltipContent} from 'parabol-client/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from 'parabol-client/ui/Tooltip/TooltipTrigger'

export type Props = {
  url: string
  onEdit: () => void
  onClear: () => void
}

export const TipTapLinkPreview = (props: Props) => {
  const {onClear, onEdit, url} = props
  return (
    <div className={'flex items-center justify-center truncate p-1'}>
      <Link
        style={{
          width: 18,
          height: 18
        }}
        className='flex-none pr-1 text-slate-700'
      />
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='text-md max-w-64 truncate break-all underline'
      >
        {url}
      </a>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={
              'flex items-center justify-center rounded border-none bg-transparent p-2 font-semibold text-black outline-none hover:bg-slate-300'
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
              'flex items-center justify-center rounded border-none bg-transparent p-2 font-semibold text-black outline-none hover:bg-slate-300'
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
