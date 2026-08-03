import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {useState} from 'react'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

interface Props {
  token: string
  onClose: () => void
}

export const PersonalAccessTokenCreateSuccess = ({token, onClose}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const onCopy = () => {
    navigator.clipboard.writeText(token)
    setIsOpen(true)
    setTimeout(() => {
      setIsOpen(false)
    }, 2000)
  }

  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='flex flex-col gap-4'>
        <DialogTitle>Token Created</DialogTitle>
        <p className='text-fg-secondary text-sm'>
          Copy your new token now — it won't be shown again.
        </p>
        <div className='flex items-center gap-2 rounded-md border border-hairline bg-surface-raised p-3'>
          <code className='flex-1 break-all font-mono text-fg-primary text-sm'>{token}</code>
          <Tooltip open={isOpen}>
            <TooltipTrigger asChild>
              <button
                onClick={onCopy}
                className='flex shrink-0 cursor-pointer rounded p-1 text-fg-muted hover:bg-surface-hover hover:text-fg-primary'
                title='Copy to clipboard'
              >
                <ContentCopyIcon fontSize='small' />
              </button>
            </TooltipTrigger>
            <TooltipContent>{'Copied!'}</TooltipContent>
          </Tooltip>
        </div>
        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='cursor-pointer rounded-md bg-sky-500 px-4 py-2 text-sm text-white hover:bg-sky-600'
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
