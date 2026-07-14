import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogDescription,
  DialogTitle
} from 'parabol-client'

export const ConfirmDelete = () => (
  <Dialog isOpen>
    <DialogContent>
      <DialogTitle>Delete “Sprint Retrospective”?</DialogTitle>
      <DialogDescription>
        This permanently removes the meeting and every reflection shared in it. This can’t be
        undone.
      </DialogDescription>
      <DialogActions>
        <Button variant='secondary' size='md'>
          Cancel
        </Button>
        <Button variant='destructive' size='md'>
          Delete meeting
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
)

export const RenameTeam = () => (
  <Dialog isOpen>
    <DialogContent className='md:w-md md:max-w-md'>
      <DialogTitle>Rename team</DialogTitle>
      <DialogDescription>Give this team a name your organization will recognize.</DialogDescription>
      <input
        className='h-11 w-full rounded-sm border border-slate-500 px-2 text-sm focus:outline-hidden'
        defaultValue='Engineering'
      />
      <DialogActions>
        <Button variant='secondary' size='md'>
          Cancel
        </Button>
        <Button variant='primary' size='md'>
          Save changes
        </Button>
      </DialogActions>
    </DialogContent>
  </Dialog>
)
