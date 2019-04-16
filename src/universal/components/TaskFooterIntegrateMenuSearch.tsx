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

const TaskFooterIntegrateMenuSearch = (_props: Props) => {
  return <Input placeholder={'Search integrations'} />
}

export default TaskFooterIntegrateMenuSearch
