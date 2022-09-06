import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'

const keyframesOpacity = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.25;
  }
}`

const DotSpan = styled('span')<{dotNumber: number}>(({dotNumber}) => ({
  animationDelay: `${dotNumber * 200}ms`,
  animationDuration: '.8s',
  animationIterationCount: 'infinite',
  animationName: keyframesOpacity.toString(),
  display: 'inline-block',
  fontWeight: 600,
  lineHeight: 'inherit',
  verticalAlign: 'baseline'
}))

const GroupStyle = styled('span')({
  display: 'inline',
  fontSize: 'inherit'
})

const Ellipsis = () => {
  const {t} = useTranslation()

  return (
    <GroupStyle>
      <DotSpan dotNumber={0}>{t('Ellipsis..')}</DotSpan>
      <DotSpan dotNumber={1}>{t('Ellipsis..')}</DotSpan>
      <DotSpan dotNumber={2}>{t('Ellipsis..')}</DotSpan>
    </GroupStyle>
  )
}

export default Ellipsis
