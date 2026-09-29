import {useState} from 'react'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {WorkDrawerDateFilter, type WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  isOpen: boolean
  onClose: () => void
  dateRange: WorkDrawerDateRange | undefined
  instructions: string
  onSave: (dateRange: WorkDrawerDateRange | undefined, instructions: string) => void
}

const InspirationSettingsDialog = (props: Props) => {
  const {isOpen, onClose, onSave} = props
  const [dateRange, setDateRange] = useState(props.dateRange)
  const [instructions, setInstructions] = useState(props.instructions)
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Draft settings</DialogTitle>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <span className='font-semibold text-fg-primary text-sm'>Date range</span>
            <div>
              <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
            </div>
          </div>
          <label className='flex flex-col gap-2'>
            <span className='font-semibold text-fg-primary text-sm'>Instructions for the AI</span>
            <textarea
              className='min-h-28 w-full resize-y rounded-md border border-hairline-field bg-surface-card p-2 text-fg-primary text-sm focus:border-accent focus:outline-none'
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder='e.g. One sentence per answer. Skip dependency bumps unless they’re blocked.'
            />
            <span className='text-fg-muted text-xs'>
              Used in every standup until you change it.
            </span>
          </label>
        </div>
        <DialogActions>
          <Button variant='secondary' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' onClick={() => onSave(dateRange, instructions)}>
            Save and redraft
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default InspirationSettingsDialog
