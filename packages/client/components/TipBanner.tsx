import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import type {ReactNode} from 'react'

const Banner = styled('div')({
  border: `1px dashed var(--color-hairline-strong)`,
  borderRadius: 4,
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  padding: 15, // 16 - 1 (border-widt)
  userSelect: 'none'
})

const StyledIcon = styled('div')({
  height: 24,
  width: 24,
  color: 'var(--color-fg-secondary)',
  marginRight: 16
})

const Inner = styled('div')({
  fontSize: 'inherit',
  lineHeight: 'inherit'
})

interface Props {
  children: ReactNode
  className?: string
  icon?: string
}

const TipBanner = (props: Props) => {
  const {children, className, icon} = props

  return (
    <Banner className={className}>
      <StyledIcon>{icon || <InfoIcon />}</StyledIcon>
      <Inner>{children}</Inner>
    </Banner>
  )
}

export default TipBanner
