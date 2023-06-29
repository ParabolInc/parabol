import React from 'react'

interface DialogActionsProps {
  children: React.ReactNode
}

export const DialogActions = (props: DialogActionsProps) => {
  const {children} = props
  return <div className='mt-6 flex justify-end space-x-2'>{children}</div>
}
