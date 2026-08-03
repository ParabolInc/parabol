import styled from '@emotion/styled'
import type * as React from 'react'
import PlainButton from './PlainButton/PlainButton'

const Button = styled(PlainButton)({
  color: 'var(--color-accent)',
  padding: 0,
  paddingLeft: 8
})

interface Props {
  label: string
  onClick(e: React.MouseEvent): void
}

const NotificationAction = (props: Props) => {
  const {label, onClick} = props
  return <Button onClick={onClick}>{label}</Button>
}

export default NotificationAction
