import React from 'react'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import useShareTopicMutation from '../mutations/useShareTopicMutation'

interface Props {
  closePortal: () => void
  stageId: string
  meetingId: string
}

const ShareTopicModal = (props: Props) => {
  const {closePortal, stageId, meetingId} = props

  const [commit, submitting] = useShareTopicMutation()

  const onShare = () => {
    commit(
      {
        variables: {
          stageId,
          meetingId,
          channelId: 'C05DALX1EKY'
        }
      },
      {
        onSuccess: closePortal
      }
    )
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
          <PrimaryButton size='small' onClick={onShare} disabled={submitting}>
            Share
          </PrimaryButton>
        </div>
      </DialogContent>
    </DialogContainer>
  )
}

export default ShareTopicModal
