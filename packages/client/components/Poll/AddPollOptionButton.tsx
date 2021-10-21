import styled from '@emotion/styled'
import React from 'react'
import {PollsAriaLabels} from '~/types/constEnums'
import {PALETTE} from '../../styles/paletteV3'
import IconOutlined from '../IconOutlined'
import PlainButton from '../PlainButton/PlainButton'

const StyledPlainButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  fontSize: 14,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  },
  transition: 'color 0.1s ease',
  marginRight: 'auto'
})

const AddPollOptionIcon = styled(IconOutlined)({
  fontSize: 20,
  width: 20,
  height: 20,
  margin: '0 4px'
})

const AddPollOptionLabel = styled('div')({
  color: 'inherit'
})

interface Props {
  onClick: () => void
  disabled?: boolean
}

export const AddPollOptionButton = (props: Props) => {
  const {onClick, disabled} = props

  return (
    <StyledPlainButton
      aria-label={PollsAriaLabels.POLL_ADD_OPTION}
      onClick={onClick}
      disabled={disabled}
    >
      <AddPollOptionIcon>add</AddPollOptionIcon>
      <AddPollOptionLabel>Add another choice</AddPollOptionLabel>
    </StyledPlainButton>
  )
}
