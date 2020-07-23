import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV2'
export const skeletonShine = keyframes`
  0% {
    background-position: -80px;
  }
  40%, 100% {
    background-position: 240px;
  }
`


const MockTemplateItemBody = styled('div')({
  padding: '12px 16px'
})

const MockTemplateItemTitle = styled('div')({
  height: 20,
  borderRadius: '20px',
  backgroundImage: `linear-gradient(90deg, ${PALETTE.TEXT_LIGHT_DARK} 0px, ${PALETTE.TEXT_LIGHT} 40px, ${PALETTE.TEXT_LIGHT_DARK} 80px)`,
  backgroundSize: 600,
  animation: `${skeletonShine.toString()} 2400ms infinite linear`,
  width: 160
})

const MockTemplateItemSubTitle = styled(MockTemplateItemTitle)({
  height: 12,
  marginTop: 8,
  width: 240
})

const MockTemplateItem = () => {
  return (
    <MockTemplateItemBody>
      <MockTemplateItemTitle />
      <MockTemplateItemSubTitle />
    </MockTemplateItemBody>
  )
}

export default MockTemplateItem
