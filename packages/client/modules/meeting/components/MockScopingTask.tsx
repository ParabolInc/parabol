import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV2'
import Checkbox from '../../../components/Checkbox'
export const skeletonShine = keyframes`
  0% {
    background-position: -80px;
  }
  40%, 100% {
    background-position: 400px;
  }
`


// const Checkbox = styled(Icon)({
//   cursor: 'default'
// })
const MockTemplateItemBody = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '8px 16px',
  height: 56
})

const MockTemplateItemTitle = styled('div')<{delay: number}>(({delay}) => ({
  animation: `${skeletonShine.toString()} 2400ms infinite linear ${delay}ms`,
  height: 16,
  borderRadius: '20px',
  backgroundImage: `linear-gradient(90deg, ${PALETTE.TEXT_LIGHT_DARK} 0px, ${PALETTE.TEXT_LIGHT} 40px, ${PALETTE.TEXT_LIGHT_DARK} 80px)`,
  backgroundSize: 600,
  marginLeft: 8,
  marginTop: 2,
  width: 320
}))

interface Props {
  idx: number
}
const MockScopingTask = (props: Props) => {
  const {idx} = props
  return (
    <MockTemplateItemBody>
      <Checkbox active={false} onClick={() => {}} />
      <MockTemplateItemTitle delay={idx * 20} />
    </MockTemplateItemBody>
  )
}

export default MockScopingTask
