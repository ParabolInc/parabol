import {Close} from '@mui/icons-material'
import React from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import FlatButton from '../../../../components/FlatButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import ArchiveTeamMutation from '../../../../mutations/ArchiveTeamMutation'

type Props = {
  teamId: string
  teamName: string
  teamLeadName: string | null
  closeModal: () => void
}

const ArchiveTeamModal = (props: Props) => {
  const {teamId, teamName, teamLeadName, closeModal} = props
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const handleClose = () => {
    closeModal()
  }

  const onSubmit = async () => {
    if (submitting) return
    submitMutation()
    await ArchiveTeamMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    closeModal()
  }

  const confirmationText = teamLeadName ? (
    <span>
      Are you sure you want to archive{' '}
      <span className='font-bold text-tomato-500'>{teamLeadName}'s</span> team "{teamName}"?
    </span>
  ) : (
    `Are you sure you want to archive your team "${teamName}"?`
  )

  return (
    <div className='flex h-auto w-auto flex-col items-center rounded-lg bg-white'>
      <div className='title-wrapper flex w-full items-center justify-between pr-6'>
        <DialogTitle className='px-6 pt-6 pb-4 text-slate-700'>{'Archive team'}</DialogTitle>
        <Close onClick={handleClose} className='text-xl text-slate-600 hover:cursor-pointer' />
      </div>
      <div className='px-6 pb-8 text-base text-slate-700'>{confirmationText}</div>
      <div className='flex w-full justify-end'>
        <FlatButton
          onClick={handleClose}
          className='mr-6 mb-6 bg-slate-500 font-semibold text-white duration-300 ease-in-out hover:bg-slate-700 focus:bg-slate-700'
        >
          {'Cancel'}
        </FlatButton>
        <FlatButton
          onClick={onSubmit}
          className='mr-6 mb-6 bg-sky-500 font-semibold text-white duration-300 ease-in-out hover:bg-sky-700 focus:bg-sky-700'
        >
          {'Confirm'}
        </FlatButton>
      </div>
    </div>
  )
}

export default ArchiveTeamModal
