import React from 'react'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

interface Props {
  closePortal: () => void
}

// TODO: Create generic dialog components using tailwind https://github.com/ParabolInc/parabol/issues/8107
const ShareTopicModal = (props: Props) => {
  const {closePortal} = props

  const onShare = () => {
    /* TODO */
  }

  return (
    <DialogContainer>
      <DialogTitle>{'Share topic'}</DialogTitle>
      <DialogContent>
        <div className={'mb-4 text-base'}>Where would you like to share the topic to?</div>

        <div className={'mt-6 flex w-full justify-end'}>
          <div className={'mr-2'}>
            <SecondaryButton onClick={closePortal} size='small'>
              Cancel
            </SecondaryButton>
          </div>
          <PrimaryButton size='small' onClick={onShare}>
            Share
          </PrimaryButton>
        </div>
      </DialogContent>
    </DialogContainer>
  )
}

export default ShareTopicModal
