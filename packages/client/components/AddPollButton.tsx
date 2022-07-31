import styled from '@emotion/styled'
import PollOutlined from '@mui/icons-material/PollOutlined'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const StyledPlainButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: PALETTE.SKY_500,
  fontWeight: 600,
  fontSize: 14,
  margin: '0 8px',
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  },
  transition: 'color 0.1s ease'
})

const AddPollIcon = styled(PollOutlined)({
  fontSize: 20,
  width: 20,
  height: 20,
  margin: '0 4px 0 0'
})

const AddPollLabel = styled('div')({
  color: 'inherit'
})

interface Props {
  onClick: () => void
  dataCy: string
  disabled?: boolean
}

const AddPollButton = (props: Props) => {
  const {onClick, dataCy, disabled} = props

  return (
    <StyledPlainButton data-cy={`${dataCy}-add`} onClick={onClick} disabled={disabled}>
      <AddPollIcon />
      <AddPollLabel>Add a poll</AddPollLabel>
    </StyledPlainButton>
  )
}

export default AddPollButton
