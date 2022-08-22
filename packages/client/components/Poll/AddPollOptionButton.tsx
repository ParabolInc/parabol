import styled from '@emotion/styled'
import {AddOutlined} from '@mui/icons-material'
import React from 'react'
import {PollsAriaLabels} from '~/types/constEnums'
import {PALETTE} from '../../styles/paletteV3'
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

const AddPollOptionIcon = styled(AddOutlined)({
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
      <AddPollOptionIcon />
      <AddPollOptionLabel>Add another choice</AddPollOptionLabel>
    </StyledPlainButton>
  )
}
