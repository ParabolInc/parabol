import React from 'react'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {SimpleModalDialog} from '../ui/Dialog/SimpleModalDialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {DialogDescription} from '../ui/Dialog/DialogDescription'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogClose} from '../ui/Dialog/DialogClose'

interface Props {
  isOpen: boolean
  onClose: () => void
  stageId: string
}

const ShareTopicModal = (props: Props) => {
  const {isOpen, onClose} = props

  const onShare = () => {
    /* TODO */
  }

  return (
    <SimpleModalDialog isOpen={isOpen} onClose={onClose}>
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
    </SimpleModalDialog>
  )
}

export default ShareTopicModal
