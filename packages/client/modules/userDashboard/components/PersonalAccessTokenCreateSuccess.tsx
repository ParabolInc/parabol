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
    <Dialog open={true} onClose={onClose}>
      <DialogContent className='flex flex-col gap-4'>
        <DialogTitle>Token Created</DialogTitle>
        <p className='text-slate-600 text-sm'>Copy your new token now — it won't be shown again.</p>
        <div className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3'>
          <code className='flex-1 break-all font-mono text-slate-800 text-sm'>{token}</code>
          <Tooltip open={isOpen}>
            <TooltipTrigger asChild>
              <button
                onClick={onCopy}
                className='flex shrink-0 cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
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
            className='cursor-pointer rounded-md bg-sky-500 px-4 py-2 text-sm text-white hover:bg-slate-700'
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
