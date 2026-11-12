import {CheckCircle} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {getAnsweredSummary} from './switchTemplateCopy'

export interface SwitchTemplateConfirmation {
  templateId: string
  templateName: string
  answeredCount: number
}

interface Props {
  confirmation: SwitchTemplateConfirmation | null
  youAnswered: boolean
  isSeriesChange: boolean
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

const TeamPromptSwitchTemplateDialog = (props: Props) => {
  const {confirmation, youAnswered, isSeriesChange, submitting, onCancel, onConfirm} = props
  const templateName = confirmation?.templateName ?? ''
  return (
    <Dialog isOpen={!!confirmation} onClose={onCancel}>
      <DialogContent className='md:w-[460px] md:max-w-[460px]'>
        <DialogTitle>Switch to {templateName}?</DialogTitle>
        <DialogDescription className='mb-0 flex flex-col gap-3 text-fg-secondary text-sm'>
          <span>{getAnsweredSummary(confirmation?.answeredCount ?? 0, youAnswered)}</span>
          {isSeriesChange && (
            <span>Future meetings in this series will use {templateName} too.</span>
          )}
          <span className='flex items-center gap-1.5 text-[13px]'>
            <CheckCircle className='size-4 text-jade-600 dark:text-jade-400' />
            Replies and tasks stay.
          </span>
        </DialogDescription>
        <DialogActions className='flex-col-reverse sm:flex-row'>
          <Button variant='outline' size='md' className='h-11 sm:h-9' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            size='md'
            className='h-11 sm:h-9'
            onClick={onConfirm}
            disabled={submitting}
          >
            Clear and switch
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default TeamPromptSwitchTemplateDialog
