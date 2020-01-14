import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import styled from '@emotion/styled'

interface Props {
  viewer: any
}

const Wrapper = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  height: 56
})
const MobileDashTopBar = (props: Props) => {
  const {viewer} = props
  return <Wrapper></Wrapper>
}

export default MobileDashTopBar
