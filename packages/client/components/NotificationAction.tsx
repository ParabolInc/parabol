import type * as React from 'react'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  label: string
  onClick(e: React.MouseEvent): void
}

const NotificationAction = (props: Props) => {
  const {label, onClick} = props
  return (
    <PlainButton className='p-0 pl-2 text-accent' onClick={onClick}>
      {label}
    </PlainButton>
  )
}

export default NotificationAction
