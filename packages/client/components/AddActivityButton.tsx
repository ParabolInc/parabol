import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
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

const Icon = styled(Add)({
  width: 20,
  height: 20,
  margin: '0 4px 0 0'
})

interface Props {
  onClick: () => void
  dataCy: string
  disabled?: boolean
}

const AddActivityButton = (props: Props) => {
  const {onClick, disabled} = props

  return (
    <StyledPlainButton onClick={onClick} disabled={disabled}>
      <Icon />
      <div className='text-inherit'>Add an activity</div>
    </StyledPlainButton>
  )
}

export default AddActivityButton
