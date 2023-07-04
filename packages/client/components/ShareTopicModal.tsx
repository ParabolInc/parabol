import React from 'react'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {DialogDescription} from '../ui/Dialog/DialogDescription'
import {DialogActions} from '../ui/Dialog/DialogActions'

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
  SelectContent
} from '../ui/Select'

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

  const labelStyles = `w-[90px] text-left text-sm font-semibold`

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Share topic</DialogTitle>
        <DialogDescription>Where would you like to share the topic to?</DialogDescription>

        <fieldset className='mx-0 mb-[15px] mb-2 flex items-center gap-5 p-0'>
          <label className={labelStyles} htmlFor='name'>
            Integration
          </label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder='Select one' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='slack'>Slack</SelectItem>
                <SelectItem value='teams'>Teams</SelectItem>
                <SelectItem value='mattermost'>Mattermost</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </fieldset>

        <DialogActions>
          <SecondaryButton onClick={onClose} size='small'>
            Cancel
          </SecondaryButton>
          <PrimaryButton size='small' onClick={onShare}>
            Share
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default ShareTopicModal
