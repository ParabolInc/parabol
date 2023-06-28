import React from 'react'

interface DialogActionsProps {
  children: React.ReactNode
}

const DialogActions = (props: DialogActionsProps) => {
  const {children} = props
  return <div className='mt-[25px] flex justify-end space-x-2'>{children}</div>
}

export default DialogActions
