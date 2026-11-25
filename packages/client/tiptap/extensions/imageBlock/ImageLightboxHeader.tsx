import * as RadixDialog from '@radix-ui/react-dialog'
import {
  Close as CloseIcon,
  FileDownloadOutlined as DownloadIcon,
  OpenInNew as OpenInNewIcon
} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {downloadImage} from './downloadImage'

interface Props {
  index: number
  count: number
  src: string
  alt?: string
}

const ICON_BUTTON = 'size-9 px-0 text-fg-secondary hover:text-fg-primary'

export const ImageLightboxHeader = (props: Props) => {
  const {index, count, src, alt} = props
  return (
    <header className='flex h-15 shrink-0 items-center gap-1 pr-3 pl-5'>
      <div className='min-w-0 flex-1'>
        <RadixDialog.Title className='m-0 truncate font-semibold text-sm'>
          {count > 1 ? `Image ${index + 1} of ${count}` : 'Image'}
        </RadixDialog.Title>
        {alt && <div className='truncate text-fg-muted text-xs'>{alt}</div>}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='flat'
            shape='icon'
            className={ICON_BUTTON}
            aria-label='Download'
            onClick={() => downloadImage(src)}
          >
            <DownloadIcon className='text-xl' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='flat' shape='icon' className={ICON_BUTTON} asChild>
            <a href={src} target='_blank' rel='noopener noreferrer' aria-label='Open original'>
              <OpenInNewIcon className='text-xl' />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open original</TooltipContent>
      </Tooltip>
      <div className='mx-1.5 h-5 w-px bg-hairline-strong' />
      <Tooltip>
        <TooltipTrigger asChild>
          <RadixDialog.Close asChild>
            <Button variant='flat' shape='icon' className={ICON_BUTTON} aria-label='Close'>
              <CloseIcon className='text-xl' />
            </Button>
          </RadixDialog.Close>
        </TooltipTrigger>
        <TooltipContent>Close · Esc</TooltipContent>
      </Tooltip>
    </header>
  )
}
