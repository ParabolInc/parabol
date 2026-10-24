import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  levelName: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const OrgTeamStructureRemoveLevelDialog = ({levelName, isOpen, onClose, onConfirm}: Props) => (
  <Dialog isOpen={isOpen} onClose={onClose}>
    <DialogContent className='md:w-md md:max-w-md'>
      <DialogTitle>Remove {levelName}?</DialogTitle>
      <DialogDescription className='text-fg-secondary'>
        Its values and every team’s place in it go too. Reports that break down by {levelName} will
        list teams instead, and reports that filter by it will stop until someone removes the
        filter.
      </DialogDescription>
      <DialogActions>
        <Button variant='outline' size='md' onClick={onClose}>
          Keep it
        </Button>
        <Button variant='destructive' size='md' onClick={onConfirm}>
          Remove level
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
)

export default OrgTeamStructureRemoveLevelDialog
