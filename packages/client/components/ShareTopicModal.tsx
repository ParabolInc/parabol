import React from 'react'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import Dialog from './Dialog/Dialog'
import DialogContent from './Dialog/DialogContent'
import DialogTitle from './Dialog/DialogTitle'
import DialogDescription from './Dialog/DialogDescription'
import DialogActions from './Dialog/DialogActions'
import DialogClose from './Dialog/DialogClose'

interface Props {
  open: boolean
  onClose: () => void
  stageId: string
}

const ShareTopicModal = (props: Props) => {
  const {open, onClose} = props

  const onShare = () => {
    /* TODO */
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Share topic</DialogTitle>
        <DialogDescription>Where would you like to share the topic to?</DialogDescription>

        <DialogActions>
          <SecondaryButton onClick={onClose} size='small'>
            Cancel
          </SecondaryButton>
          <PrimaryButton size='small' onClick={onShare}>
            Share
          </PrimaryButton>
        </DialogActions>
        <DialogClose />
      </DialogContent>
    </Dialog>
  )
}

export default ShareTopicModal
