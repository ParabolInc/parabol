import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {useState} from 'react'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'

interface Props {
  token: string
  onClose: () => void
}

export const PersonalAccessTokenCreateSuccess = ({token, onClose}: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogContent className='flex flex-col gap-4'>
        <DialogTitle>Token Created</DialogTitle>
        <p className='text-slate-600 text-sm'>Copy your new token now — it won't be shown again.</p>
        <div className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3'>
          <code className='flex-1 break-all font-mono text-slate-800 text-sm'>{token}</code>
          <button
            onClick={handleCopy}
            className='shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            title='Copy to clipboard'
          >
            <ContentCopyIcon fontSize='small' />
          </button>
        </div>
        {copied && <p className='text-green-600 text-sm'>Copied to clipboard!</p>}
        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700'
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
