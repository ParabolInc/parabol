import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogDescription,
  DialogTitle
} from 'parabol-client'

export const Composed = () => (
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
