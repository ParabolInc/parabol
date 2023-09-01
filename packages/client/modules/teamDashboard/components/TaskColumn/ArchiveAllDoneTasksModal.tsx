import styled from '@emotion/styled'
import React from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import BatchArchiveTasksMutation from '../../../../mutations/BatchArchiveTasksMutation'
import {Close} from '@mui/icons-material'
import FlatButton from '../../../../components/FlatButton'
import DialogTitle from '../../../../components/DialogTitle'

const ModalBoundary = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#FFFFFF',
  borderRadius: 8,
  height: 374,
  width: 700
})

type Props = {
  taskIds: string[]
  closeModal: () => void
}

const UserAvatarInput = (props: Props) => {
  const {closeModal, taskIds} = props
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()

  const handleClose = () => {
    closeModal()
  }

  const onSubmit = async () => {
    if (submitting) return
    submitMutation()
    BatchArchiveTasksMutation(atmosphere, {taskIds}, {onCompleted, onError})
    closeModal()
  }

  return (
    <ModalBoundary>
      <div className='title-wrapper flex w-full items-center justify-between pr-6'>
        <DialogTitle className='text-slate-700'>{'Archive all'}</DialogTitle>
        <Close onClick={handleClose} className='text-xl text-slate-600 hover:cursor-pointer' />
      </div>
      <div>
        This action will archive all <b>Done</b> tasks. Are you sure you want to proceed?
      </div>
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
    </ModalBoundary>
  )
}

export default UserAvatarInput
