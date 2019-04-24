import React, {useCallback, useRef} from 'react'
import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  placeholder: string
}

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
  const {onChange, placeholder, value} = props
  const ref = useRef<HTMLInputElement>(null)
  const onBlur = useCallback(() => {
    ref.current && ref.current.focus()
  }, [])
  return (
    <Input
      autoFocus
      innerRef={ref}
      name='search'
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  )
}

export default TaskFooterIntegrateMenuSearch
