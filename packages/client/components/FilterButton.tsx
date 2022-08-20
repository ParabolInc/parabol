import styled from '@emotion/styled'
import {FilterList} from '@mui/icons-material'
import React, {forwardRef, Ref} from 'react'
import {PALETTE} from '../styles/paletteV3'
import FlatButton from './FlatButton'

const StyledButton = styled(FlatButton)({
  height: 24,
  marginLeft: 4,
  padding: 0,
  width: 24,
  background: PALETTE.SKY_500,
  '&:hover': {
    background: PALETTE.SKY_500
  }
})

const FilterIcon = styled(FilterList)({
  color: PALETTE.WHITE,
  height: 18,
  width: 18
})

interface Props {
  onClick: () => void
}

const FilterButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {onClick} = props
  return (
    <StyledButton onClick={onClick} ref={ref}>
      <FilterIcon />
    </StyledButton>
  )
})

export default FilterButton
