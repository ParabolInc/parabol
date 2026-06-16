import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {DeleteAccountModal_viewer$key} from '../__generated__/DeleteAccountModal_viewer.graphql'
import DeleteUserMutation from '../mutations/DeleteUserMutation'
import {ExternalLinks} from '../types/constEnums'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import DeleteAccountReAuthStep from './DeleteAccountReAuthStep'
import BasicTextArea from './InputField/BasicTextArea'
import PrimaryButton from './PrimaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  viewerRef: DeleteAccountModal_viewer$key
}

const DeleteAccountModal = ({isOpen, onClose, viewerRef}: Props) => {
  const viewer = useFragment(
    graphql`
      fragment DeleteAccountModal_viewer on User {
        ...DeleteAccountReAuthStep_viewer
      }
    `,
    viewerRef
  )
  const [step, setStep] = useState<'reason' | 'reauth'>('reason')
  const [reason, setReason] = useState('')
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value)
  }
  const validReason = reason.trim().slice(0, 20000)
  const handleDelete = () => {
    DeleteUserMutation(
      atmosphere,
      {
        userId: atmosphere.viewerId,
        reason: validReason
      },
      {
        onCompleted: (res) => {
          if (res?.deleteUser?.error?.message?.includes('re-authenticate')) {
            setStep('reauth')
          } else {
            window.location.href = ExternalLinks.RESOURCES
          }
        }
      }
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        {step === 'reauth' ? (
          <div>
            <DialogTitle className='mb-4 flex justify-center'>Verify your identity</DialogTitle>
            <div className='flex flex-col items-center'>
              <p className='w-full max-w-[240px] pb-4 text-[15px] leading-5'>
                {'Please verify your identity before deleting your account.'}
              </p>
              <DeleteAccountReAuthStep viewerRef={viewer} onReAuthSuccess={handleDelete} />
            </div>
          </div>
        ) : (
          <div>
            <DialogTitle className='mb-2'>How could we do better?</DialogTitle>
            <div>
              <p className='flex items-center pb-4 text-[15px] leading-[21px]'>
                {'We’re on a mission to make every meeting worth the time invested.'}
              </p>
              <p className='flex items-center pb-4 text-[15px] leading-[21px]'>
                {'If there is anything we can do to improve, let us know below.'}
              </p>
              <BasicTextArea
                autoFocus
                name='reason'
                onChange={onChange}
                placeholder=''
                value={reason}
              />
              <div className='mt-6 flex justify-end'>
                <PrimaryButton onClick={handleDelete} disabled={!reason} size='medium'>
                  {'Goodbye forever'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAccountModal
