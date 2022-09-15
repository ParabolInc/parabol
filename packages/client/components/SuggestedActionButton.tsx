import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import PrimaryButton from './PrimaryButton'

const ActionButton = styled(PrimaryButton)({
  fontSize: 14,
  marginBottom: 16,
  padding: '4px 16px'
})

interface Props {
  children: string
  onClick?: () => void
}

const SuggestedActionButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {children, onClick} = props
  return (
    <ActionButton ref={ref} aria-label={children} size='medium' onClick={onClick}>
      {children}
    </ActionButton>
  )
})

export default SuggestedActionButton
