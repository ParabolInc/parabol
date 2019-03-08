import React from 'react'
import styled from 'react-emotion'
import PrimaryButton from 'universal/components/PrimaryButton'

const ActionButton = styled(PrimaryButton)({
  fontSize: 14,
  marginBottom: 16,
  padding: '4px 16px'
})

interface Props {
  children: string
  onClick?: () => void
}

const SuggestedActionButton = (props: Props) => {
  const {children, onClick} = props
  return (
    <ActionButton aria-label={children} size="medium" onClick={onClick}>
      {children}
    </ActionButton>
  )
}

export default SuggestedActionButton
