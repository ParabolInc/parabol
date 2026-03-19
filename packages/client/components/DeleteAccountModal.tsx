import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {DeleteAccountModal_viewer$key} from '../__generated__/DeleteAccountModal_viewer.graphql'
import DeleteUserMutation from '../mutations/DeleteUserMutation'
import {ExternalLinks} from '../types/constEnums'
import DeleteAccountReAuthStep from './DeleteAccountReAuthStep'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'
import PrimaryButton from './PrimaryButton'

interface Props {
  viewerRef: DeleteAccountModal_viewer$key
}

const DeleteAccountModal = ({viewerRef}: Props) => {
  const viewer = useFragment(
    graphql`
      fragment DeleteAccountModal_viewer on User {
        ...DeleteAccountReAuthStep_viewer
      }
    `,
    viewerRef
  )
  const [step, setStep] = useState<'reauth' | 'reason'>('reauth')
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
        onCompleted: () => {
          window.location.href = ExternalLinks.RESOURCES
        }
      }
    )
  }

  if (step === 'reauth') {
    return (
      <DialogContainer className='w-[356px]'>
        <DialogTitle className='mt-4 flex justify-center'>Verify your identity</DialogTitle>
        <DialogContent className='flex flex-col items-center'>
          <p className='w-full max-w-[240px] pb-4 text-[15px] leading-5'>
            {'Please verify your identity before deleting your account.'}
          </p>
          <DeleteAccountReAuthStep viewerRef={viewer} onReAuthSuccess={() => setStep('reason')} />
        </DialogContent>
      </DialogContainer>
    )
  }

  return (
    <DialogContainer className='w-[400px]'>
      <DialogTitle className='min-[864px]:mb-2 min-[864px]:pt-6 min-[864px]:pl-8 min-[864px]:text-2xl min-[864px]:leading-8'>
        How could we do better?
      </DialogTitle>
      <DialogContent className='min-[864px]:flex min-[864px]:items-center min-[864px]:px-8 min-[864px]:pt-4 min-[864px]:pb-8'>
        <div className='min-[864px]:max-w-[320px]'>
          <p className='flex items-center pb-4 text-[15px] leading-[21px]'>
            {'We\u2019re on a mission to make every meeting worth the time invested.'}
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
      </DialogContent>
    </DialogContainer>
  )
}

export default DeleteAccountModal
