import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import React from 'react'

interface Props {}

const Input = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: 0,
  display: 'block',
  fontSize: 15,
  lineHeight: 2,
  outline: 'none',
  padding: 0,
  width: '100%',
  '&:focus,:active': {
    ':placeholder': PALETTE.TEXT.MAIN
  }
})

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TaskFooterIntegrateMenuSearch = (props: Props) => {
  const {onChange, value} = props
  return (
    <Input
      autoFocus
      name='search'
      onChange={onChange}
      placeholder={'Search integrations'}
      value={value}
    />
  )
}

export default TaskFooterIntegrateMenuSearch
