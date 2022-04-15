import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import FlatButton from './FlatButton'
import Icon from './Icon'

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

const FilterIcon = styled(Icon)({
  color: PALETTE.WHITE,
  fontSize: ICON_SIZE.MD18
})

interface Props {
  onClick: () => void
}

const FilterButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  return (
    <StyledButton onClick={props.onClick} ref={ref}>
      <FilterIcon>filter_list</FilterIcon>
    </StyledButton>
  )
})

export default FilterButton
