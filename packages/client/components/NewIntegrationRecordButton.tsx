import type * as React from 'react'
import {Add} from '~/ui/icons'
import FloatingActionButton from './FloatingActionButton'

interface Props {
  labelText: string
  onClick: (e: React.MouseEvent) => void
}

const NewIntegrationRecordButton = (props: Props) => {
  const {labelText, onClick} = props
  return (
    <FloatingActionButton
      onClick={onClick}
      palette='blue'
      className='absolute right-4 bottom-4 z-fab min-w-[150px] px-3 py-[10px] text-white'
    >
      <Add className='mr-2' />
      <div className='font-semibold text-[16px]'>{labelText}</div>
    </FloatingActionButton>
  )
}

export default NewIntegrationRecordButton
