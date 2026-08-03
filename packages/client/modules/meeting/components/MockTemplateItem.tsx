import {keyframes} from '@emotion/react'
import styled from '@emotion/styled'
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
  backgroundImage: `linear-gradient(90deg, var(--color-hairline-strong) 0px, var(--color-surface-well) 40px, var(--color-hairline-strong) 80px)`,
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
