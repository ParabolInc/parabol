import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import React from 'react'

interface Props {
  placeholder: string
}

const Input = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: `1px solid ${PALETTE.BORDER.LIGHT}`,
  borderRadius: 2,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '3px 0 3px 39px',
  width: '100%',
  '&:focus,:active': {
    border: `1px solid rgb(${PALETTE.BORDER.BLUE_RGB})`,
    boxShadow: `0 0 1px 1px rgba(${PALETTE.BORDER.BLUE_RGB}, .5)`
  }
})

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TaskFooterIntegrateMenuSearch = (props: Props) => {
  const {onChange, placeholder, value} = props
  return (
    <Input autoFocus name='search' onChange={onChange} placeholder={placeholder} value={value} />
  )
}

export default TaskFooterIntegrateMenuSearch
